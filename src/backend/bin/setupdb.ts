import mysql from 'mysql2';

const port = process.env.DATABASE_PORT ?
  parseInt(process.env.DATABASE_PORT) :
  3306;

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port,
  namedPlaceholders: true
});

const promisePool = pool.promise();

const tableExists = async (tableName: string): Promise<boolean> => {
  const conn = await promisePool.getConnection();

  const res = await conn.query(`
    SELECT table_name
    FROM information_schema.tables 
    WHERE table_schema = ? 
    AND table_name = ?
  `, [process.env.DATABASE_NAME, tableName]);
  const rows: Record<string, string>[] = (res[0] as Record<string, string>[]);
  return rows.length === 1;
}

const populateDatabase = async () => {
  const appropiatePool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port,
    namedPlaceholders: true
  });

  const conn = await appropiatePool.promise().getConnection();

  console.log("Checking");
  if (! await tableExists("user")) {
    console.log("Creating user table");
    await conn.query(`
      CREATE TABLE user (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
        firstname VARCHAR(64) NOT NULL,
        lastname VARCHAR(64) NOT NULL,
        email VARCHAR(256) UNIQUE NOT NULL,
        password VARCHAR(256) NOT NULL,
        img VARCHAR(256) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        status TINYINT DEFAULT 0 NOT NULL
      );
    `);
  }
  if (! await tableExists("admin")) {
    console.log("Creating admin table");
    await conn.query(`
      CREATE TABLE admin (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
        username VARCHAR(256) UNIQUE NOT NULL,
        password VARCHAR(256) NOT NULL
      );
    `);
  }
  if (! await tableExists("user_verification")) {
    console.log("Creating user verification table");
    await conn.query(`
      CREATE TABLE user_verification (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        token VARCHAR(64) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);
  }
  conn.destroy();
}

(async () => {
  const conn = await promisePool.getConnection();
  const res = await conn.query(
    'SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?',
    [process.env.DATABASE_NAME]
  );
  const rows: Record<string, string>[] = (res[0] as Record<string, string>[]);
  if (rows.length === 1) {
    console.log("Database exists");
    console.log("Populating schemas");
    await populateDatabase();
    conn.destroy();
    process.exit(0);
  }
  await conn.query(
    `CREATE DATABASE ${process.env.DATABASE_NAME}`
  );
  console.log("Database created");
  console.log("Adding privileges");
  await conn.query(
    `GRANT CREATE, SELECT, UPDATE, INSERT ON ${process.env.DATABASE_NAME}.* TO '${process.env.DATABASE_USER}'@'%' IDENTIFIED BY '${process.env.DATABASE_PASSWORD}'`,
  );
  await conn.query(
    'FLUSH PRIVILEGES'
  );
  console.log("Populating schemas");
  await populateDatabase();
  conn.destroy();
  process.exit(0);
})();