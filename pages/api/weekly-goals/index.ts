import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  const userId = user.id;

  switch (req.method) {
    case 'GET':
      try {
        const { year, month, week } = req.query;
        const result = await pool.query(
          `SELECT * FROM weekly_goals 
           WHERE user_id = $1 AND target_year = $2 AND target_month = $3 AND target_week = $4
           ORDER BY created_at DESC`,
          [userId, year, month, week]
        );
        res.status(200).json(result.rows);
      } catch (error) {
        console.error('Error fetching weekly goals:', error);
        res.status(500).json({ message: '목표 조회 중 오류가 발생했습니다.' });
      }
      break;

    case 'POST':
      try {
        const { title, targetYear, targetMonth, targetWeek, memo } = req.body;
        const result = await pool.query(
          `INSERT INTO weekly_goals (user_id, title, target_year, target_month, target_week, memo)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [userId, title, targetYear, targetMonth, targetWeek, memo]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating weekly goal:', error);
        res.status(500).json({ message: '목표 생성 중 오류가 발생했습니다.' });
      }
      break;

    case 'PUT':
      try {
        const { id, title, targetYear, targetMonth, targetWeek, memo } = req.body;
        const result = await pool.query(
          `UPDATE weekly_goals 
           SET title = $1, target_year = $2, target_month = $3, target_week = $4, memo = $5, updated_at = CURRENT_TIMESTAMP
           WHERE id = $6 AND user_id = $7
           RETURNING *`,
          [title, targetYear, targetMonth, targetWeek, memo, id, userId]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: '목표를 찾을 수 없습니다.' });
        }
        
        res.status(200).json(result.rows[0]);
      } catch (error) {
        console.error('Error updating weekly goal:', error);
        res.status(500).json({ message: '목표 수정 중 오류가 발생했습니다.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
