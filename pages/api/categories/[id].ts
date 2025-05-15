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

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: '올바른 카테고리 ID가 필요합니다.' });
    }

    switch (req.method) {
      case 'GET':
        return handleGetOne(req, res, user.id, parseInt(id));
      case 'PUT':
        return handleUpdate(req, res, user.id, parseInt(id));
      case 'DELETE':
        return handleDelete(req, res, user.id, parseInt(id));
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Category API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 특정 카테고리 조회
async function handleGetOne(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  categoryId: number
) {
  const result = await pool.query(
    `SELECT c.*, COUNT(g.id) as goal_count
     FROM categories c
     LEFT JOIN goals g ON c.id = g.category_id
     WHERE c.id = $1 AND c.user_id = $2
     GROUP BY c.id`,
    [categoryId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
  }

  return res.status(200).json(result.rows[0]);
}

// 카테고리 수정
async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  categoryId: number
) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: '카테고리 이름은 필수입니다.' });
  }

  // 카테고리 존재 여부 확인
  const existingCategory = await pool.query(
    'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
    [categoryId, userId]
  );

  if (existingCategory.rows.length === 0) {
    return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
  }

  // 중복 이름 확인
  const duplicateName = await pool.query(
    'SELECT * FROM categories WHERE user_id = $1 AND name = $2 AND id != $3',
    [userId, name, categoryId]
  );

  if (duplicateName.rows.length > 0) {
    return res.status(400).json({ message: '이미 존재하는 카테고리 이름입니다.' });
  }

  const result = await pool.query(
    `UPDATE categories 
     SET name = $1
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [name, categoryId, userId]
  );

  return res.status(200).json(result.rows[0]);
}

// 카테고리 삭제
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  categoryId: number
) {
  // 해당 카테고리의 목표 수 확인
  const goalCount = await pool.query(
    'SELECT COUNT(*) FROM goals WHERE category_id = $1',
    [categoryId]
  );

  if (parseInt(goalCount.rows[0].count) > 0) {
    return res.status(400).json({ 
      message: '이 카테고리에 속한 목표가 있어 삭제할 수 없습니다. 먼저 목표를 다른 카테고리로 이동하거나 삭제해주세요.' 
    });
  }

  const result = await pool.query(
    'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
    [categoryId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
  }

  return res.status(200).json({ message: '카테고리가 삭제되었습니다.' });
}
