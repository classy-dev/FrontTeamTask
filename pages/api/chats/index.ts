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
      case 'PUT':
        return handleUpdate(req, res, user.id);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Chats API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 대화 기록 생성
async function handleCreate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
  }

  const result = await pool.query(
    `INSERT INTO chat_histories (
      user_id,
      title,
      content
    ) VALUES ($1, $2, $3)
    RETURNING *`,
    [userId, title, content]
  );

  return res.status(201).json(result.rows[0]);
}

// 대화 기록 목록 조회
async function handleGetAll(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const result = await pool.query(
    `SELECT *
     FROM chat_histories
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return res.status(200).json(result.rows);
}

// 대화 내용 업데이트
async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const { id, content } = req.body;

  if (!id || !content) {
    return res.status(400).json({ message: 'ID와 내용은 필수입니다.' });
  }

  // 해당 대화 세션이 사용자의 것인지 확인
  const checkResult = await pool.query(
    'SELECT id FROM chat_histories WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ message: '대화 세션을 찾을 수 없습니다.' });
  }

  const result = await pool.query(
    `UPDATE chat_histories
     SET content = $1
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [content, id, userId]
  );

  return res.status(200).json(result.rows[0]);
}
