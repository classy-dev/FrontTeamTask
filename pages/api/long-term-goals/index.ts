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
        const { year } = req.query;
        const result = await pool.query(
          `SELECT * FROM long_term_goals 
           WHERE user_id = $1 AND target_year = $2 
           ORDER BY created_at DESC`,
          [userId, year]
        );
        res.status(200).json(result.rows);
      } catch (error) {
        console.error('Error fetching long term goals:', error);
        res.status(500).json({ message: '목표 조회 중 오류가 발생했습니다.' });
      }
      break;

    case 'POST':
      try {
        const { title, targetYear, memo } = req.body;
        const result = await pool.query(
          `INSERT INTO long_term_goals (user_id, title, target_year, memo)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [userId, title, targetYear, memo]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating long term goal:', error);
        res.status(500).json({ message: '목표 생성 중 오류가 발생했습니다.' });
      }
      break;

    case 'PUT':
      try {
        const { id, title, targetYear, memo } = req.body;
        const result = await pool.query(
          `UPDATE long_term_goals 
           SET title = $1, target_year = $2, memo = $3, updated_at = CURRENT_TIMESTAMP
           WHERE id = $4 AND user_id = $5
           RETURNING *`,
          [title, targetYear, memo, id, userId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ message: '목표를 찾을 수 없습니다.' });
        }
        res.status(200).json(result.rows[0]);
      } catch (error) {
        console.error('Error updating long term goal:', error);
        res.status(500).json({ message: '목표 수정 중 오류가 발생했습니다.' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const result = await pool.query(
          `DELETE FROM long_term_goals 
           WHERE id = $1 AND user_id = $2
           RETURNING *`,
          [id, userId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ message: '목표를 찾을 수 없습니다.' });
        }
        res.status(200).json(result.rows[0]);
      } catch (error) {
        console.error('Error deleting long term goal:', error);
        res.status(500).json({ message: '목표 삭제 중 오류가 발생했습니다.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
