import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { getAuthUser } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    switch (req.method) {
      case 'POST':
        return handleCreate(req, res, user.id);
      case 'GET':
        return handleGetAll(req, res, user.id);
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 카테고리 생성
async function handleCreate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: '카테고리 이름은 필수입니다.' });
  }

  // 중복 카테고리 확인
  const existing = await pool.query(
    'SELECT * FROM categories WHERE user_id = $1 AND name = $2',
    [userId, name]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({ message: '이미 존재하는 카테고리입니다.' });
  }

  const result = await pool.query(
    `INSERT INTO categories (user_id, name)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, name]
  );

  return res.status(201).json(result.rows[0]);
}

// 카테고리 목록 조회
async function handleGetAll(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const result = await pool.query(
    `SELECT c.*, COUNT(g.id) as goal_count
     FROM categories c
     LEFT JOIN goals g ON c.id = g.category_id
     WHERE c.user_id = $1
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    [userId]
  );

  return res.status(200).json(result.rows);
}
