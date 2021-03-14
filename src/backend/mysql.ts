import mysql from 'mysql2';

const port = process.env.DATABASE_PORT ?
  parseInt(process.env.DATABASE_PORT) :
  3306;

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port,
  namedPlaceholders: true
});

const promisePool = pool.promise();

export { promisePool as pool };