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
    // long_term_goals 테이블에 memo 컬럼 추가
    await pool.query(`
      ALTER TABLE long_term_goals
      ADD COLUMN IF NOT EXISTS memo TEXT;
    `);

    // monthly_goals 테이블에 memo 컬럼 추가
    await pool.query(`
      ALTER TABLE monthly_goals
      ADD COLUMN IF NOT EXISTS memo TEXT;
    `);

    res.status(200).json({ message: 'memo 컬럼이 추가되었습니다.' });
  } catch (error) {
    console.error('Column addition error:', error);
    res.status(500).json({ 
      message: '컬럼 추가 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
