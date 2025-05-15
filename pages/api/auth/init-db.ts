import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Current environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      NODE_ENV: process.env.NODE_ENV,
    });

    // Drop existing table if exists
    await pool.query(`
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create trigger for updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    res.status(200).json({ message: '데이터베이스 초기화가 완료되었습니다.' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      message: '데이터베이스 초기화 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
