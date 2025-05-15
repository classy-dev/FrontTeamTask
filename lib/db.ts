import { Pool } from 'pg';

if (!process.env.DB_HOST) {
  throw new Error('DB_HOST is not defined in environment variables');
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
