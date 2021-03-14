import { User, UserRegistrationInformation, UserVerification, UsersStats } from './types';
import { pool } from '../mysql';
import aws from 'aws-sdk';
import { mailgun, from as emailFrom } from '../mailgun';
import { DuplicateIdentifierError, EntityNotFoundError } from '../errors';
import { ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';
import FileType from 'file-type';
import { ValidationError } from 'yup';
import { format } from 'util';
import { randomBytes } from 'crypto';
const s3 = new aws.S3();

export const getS3Image = async (key: string): Promise<{ mimetype: string, data: string }> => {
  const res = await s3.getObject({
    Key: key,
    Bucket: 'basma-users-images'
  }).promise();

  return {
    mimetype: res.ContentType || "",
    data: res.Body?.toString('base64') || ""
  };
}

const uploadImg = async (email: string, img: string): Promise<string> => {
  const res = await FileType.fromBuffer(Buffer.from(img, 'base64'));
  if (!res) {
    throw new ValidationError("Invalid image file! Please make sure you selected a valid image");
  }
  const { mime } = res;
  if (!mime.match(/^image\/.*$/)) {
    throw new ValidationError("Invalid image file! Please make sure you selected a valid image");
  }
  return s3.upload({
    Key: email,
    Bucket: 'basma-users-images',
    Body: img
  }).promise().then(() => {
    return 's3://basma-users-images/' + email
  });
}

const sendEmail = (host: string, email: string, token: string) => {
  return mailgun.messages().send({
    from: emailFrom,
    to: email,
    subject: "Basma User Registration",
    text: format('Please go to http://%s/user/verify/%s to verify your account', host, token)
  })
}

export const getUser = async (email: string): Promise<User> => {
  const connection = await pool.getConnection();
  return connection.query('SELECT id, firstname, lastname, email, password, img, created_at as createdAt, status from user WHERE email = ?', [email])
    .then(res => {
      const users: User[] = (res[0] as User[]);
      if (users.length === 0) {
        throw new EntityNotFoundError("Unable to locate user with email: " + email);
      }
      return users[0];
    })
    .finally(() => {
      connection.destroy();
    })
}

export const userExists = async (email: string): Promise<boolean> => {
  try {
    await getUser(email);
    return true;
  } catch (e) {
    if (!(e instanceof EntityNotFoundError)) {
      throw e;
    }
    return false;
  }
}

export const createUser = async (host: string, userRegistration: UserRegistrationInformation): Promise<User> => {
  if (await userExists(userRegistration.email)) {
    throw new DuplicateIdentifierError("Unable to create user, email already taken");
  }
  const token = randomBytes(16).toString('hex');
  const password = await bcrypt.hash(userRegistration.password, 16);
  const img = userRegistration.img ? await uploadImg(userRegistration.email, userRegistration.img) : null;
  const connection = await pool.getConnection();
  let user: User;
  // P.S. the best approach would be to use transactions...
  return connection.execute(
    'INSERT INTO user (firstname, lastname, email, password, img) VALUES ' +
        '(:firstname, :lastname, :email, :password, :img)',
    {
      firstname: userRegistration.firstname,
      lastname: userRegistration.lastname,
      email: userRegistration.email,
      password: password,
      img: img,
      status: 0
    }
  )
    .then(result => {
      const res: ResultSetHeader = (result[0] as ResultSetHeader);
      user = {
        id: res.insertId,
        ...userRegistration,
        password,
        img,
        status: 0
      };
      return connection.execute(
        'INSERT INTO user_verification (user_id, token) VALUES (:userId, :token)',
        {
          userId: user.id,
          token: token
        }
      );
    })
    .then(async () => {
      await sendEmail(host, userRegistration.email, token);
      return user;
    })
    .finally(() => {
      connection.destroy();
    })
}

export const getUsers = async (periodFilter?: number, search?: string): Promise<User[]> => {
  const [where, params] = processFilter(periodFilter, search);
  const connection = await pool.getConnection();
  return connection.query(
    'SELECT id, firstname, lastname, email, password, img, created_at as createdAt, status from user'
        + " " + where, params
  )
    .then(res => {
      const users: User[] = (res[0] as User[]);
      return users;
    })
    .finally(() => {
      connection.destroy();
    })
};

export const getUserCount = async (periodFilter?: number, search?: string): Promise<number> => {
  const [where, params] = processFilter(periodFilter, search);
  const connection = await pool.getConnection();
  return connection.query(
    'SELECT COUNT(*) as count from user'
        + " " + where, params
  )
    .then(res => {
      const count: number = ((res[0] as { count: number }[])[0] as { count: number }).count;
      return count;
    })
    .finally(() => {
      connection.destroy();
    })
}

export const getStats = async (): Promise<UsersStats> => {
  const promises: Promise<number>[] = [];
  promises.push(getUserCount(1));
  promises.push(getUserCount(2));
  promises.push(getUserCount(4));
  promises.push(getUserCount(8));
  promises.push(getUserCount(16));
  return Promise.all(promises)
    .then(([last24Hours, lastWeek, lastMonth, last3Months, lastYear]) => {
      return {
        last24Hours,
        lastWeek,
        lastMonth,
        last3Months,
        lastYear
      };
    })
}

const processFilter = (periodFilter?: number, search?: string): [string, string[]] => {
  let sql = '';
  if (!periodFilter) {
    periodFilter = 0;
  }
  if (periodFilter & 1) {
    sql += '(created_at >= now() - INTERVAL 1 DAY)'
  } else if (periodFilter & 2) {
    sql += '(created_at >= now() - INTERVAL 1 WEEK)'
  } else if (periodFilter & 4) {
    sql += '(created_at >= now() - INTERVAL 1 MONTH)'
  } else if (periodFilter & 8) {
    sql += '(created_at >= now() - INTERVAL 3 MONTH)'
  } else if (periodFilter & 16) {
    sql += '(created_at >= now() - INTERVAL 1 YEAR)'
  }

  let params: string[] = [];
  const searchColumns = ['id', 'firstname', 'lastname', 'email'];
  if (search) {
    if (sql) {
      sql += ' AND ';
    }
    sql += '(';
    for (let i = 0; i < searchColumns.length; i++) {
      sql += searchColumns[i] + " LIKE ? ";
      if (i !== searchColumns.length - 1) {
        sql += "OR ";
      }
    }
    sql += ')';
    params = searchColumns.map(() => '%' + search + '%');
  }
  if (sql) {
    sql = 'WHERE ' + sql;
  }
  return [sql, params];
}

export const verifyUser = async (token: string): Promise<unknown> => {
  const conn = await pool.getConnection();
  const list: UserVerification[] = [];
  const query = 'SELECT id, user_id as userId, token, created_at AS createdAt FROM user_verification';
  return conn.query(format("%s WHERE token = ?", query), [token])
    .then(([res]) => {
      const rows: UserVerification[] = (res as UserVerification[]);
      if (rows.length === 0) {
        throw new Error("Unable to find token");
      }
      list.push(rows[0]);
      return conn.query(
        format("%s WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", query),
        [rows[0].userId]
      );
    })
    .then(([res]) => {
      const rows: UserVerification[] = (res as UserVerification[]);
      if (rows.length === 0) {
        throw new Error("Unable to find token");
      }
      list.push(rows[0]);
      const [match, last] = list;
      if (last.token !== match.token) {
        throw new Error("Your token has expired!");
      }
      return conn.query('UPDATE user SET status = 1 WHERE id = ?', [match.userId]);
    });
}