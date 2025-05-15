import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // user_profiles 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        content TEXT,
        consultant_style TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // updated_at 자동 업데이트를 위한 트리거
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
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
      CREATE TRIGGER update_user_profiles_updated_at
        BEFORE UPDATE ON user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    res.status(200).json({ message: '사용자 프로필 테이블이 생성되었습니다.' });
  } catch (error) {
    console.error('Table creation error:', error);
    res.status(500).json({ 
      message: '테이블 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
