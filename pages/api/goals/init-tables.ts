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
    // 카테고리 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 목표 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        trigger_action VARCHAR(255),
        importance INTEGER DEFAULT 5,
        memo TEXT,
        status VARCHAR(50) DEFAULT '진행 전',
        category_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

    // 목표 분석 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goal_analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        period VARCHAR(50) NOT NULL,
        goals_analyzed TEXT NOT NULL,
        analysis_result TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
      DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
      CREATE TRIGGER update_goals_updated_at
        BEFORE UPDATE ON goals
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    res.status(200).json({ message: '목표 관리 테이블이 생성되었습니다.' });
  } catch (error) {
    console.error('Table creation error:', error);
    res.status(500).json({ 
      message: '테이블 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
