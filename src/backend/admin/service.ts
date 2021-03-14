import { Admin, AdminLogin, AdminRegister } from './types';
import { pool } from '../mysql';
import { DuplicateIdentifierError, EntityNotFoundError } from '../errors';
import bcrypt from 'bcryptjs';
import { ResultSetHeader } from 'mysql2';
import { sign } from 'jsonwebtoken';
import { promisify } from 'util';
import { jwtSecret } from '../auth';
const asyncSign = promisify(sign);

export const getAdmin = async (username: string): Promise<Admin> => {
  const connection = await pool.getConnection();
  return connection.query('SELECT * from admin WHERE username = ?', [username])
    .then(res => {
      const admins: Admin[] = (res[0] as Admin[]);
      if (admins.length === 0) {
        throw new EntityNotFoundError("Unable to locate admin with the provided username and password");
      }
      return admins[0];
    })
}

export const adminExists = async (username: string): Promise<boolean> => {
  try {
    await getAdmin(username);
    return true;
  } catch (e) {
    if (!(e instanceof EntityNotFoundError)) {
      throw e;
    }
    return false;
  }
}

export const createAdmin = async (admin: AdminRegister): Promise<Admin> => {
  if (await adminExists(admin.username)) {
    throw new DuplicateIdentifierError("Unable to create admin, username already taken");
  }
  admin.password = await bcrypt.hash(admin.password, 16);
  const connection = await pool.getConnection();
  return connection.execute(
    'INSERT INTO admin (username, password) VALUES (:username, :password)',
    {
      username: admin.username,
      password: admin.password
    }
  ).then((result) => {
    const res: ResultSetHeader = (result[0] as ResultSetHeader);
    return {
      id: res.insertId,
      ...admin
    };
  });
}

export const getAdmins = async (): Promise<Admin[]> => {
  const connection = await pool.getConnection();
  return connection.query('SELECT * from admin')
    .then(res => {
      const admins: Admin[] = (res[0] as Admin[]);
      return admins;
    });
};

export const authenticateAdmin = async (adminLogin: AdminLogin): Promise<string> => {
  if (! jwtSecret) {
    throw new Error("JWT secret must be set in the environment variables");
  }
  const admin = await getAdmin(adminLogin.username);
  return bcrypt.compare(adminLogin.password, admin.password)
    .then(function(result) {
      if (! result) {
        throw new EntityNotFoundError("Unable to locate admin with the provided username and password");
      }
      return asyncSign({ type: "human", id: admin.id }, jwtSecret)
        .then((token) => {
          return token as string;
        });
    });
}

//export { getUsers, getUser };