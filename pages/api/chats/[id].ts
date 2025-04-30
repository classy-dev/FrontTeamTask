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
      return res.status(400).json({ message: '올바른 대화 기록 ID가 필요합니다.' });
    }

    switch (req.method) {
      case 'GET':
        return handleGetOne(req, res, user.id, parseInt(id));
      case 'DELETE':
        return handleDelete(req, res, user.id, parseInt(id));
      case 'PATCH':
        return handlePatch(req, res, user.id, parseInt(id));
      default:
        res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 특정 대화 기록 조회
async function handleGetOne(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  chatId: number
) {
  const result = await pool.query(
    'SELECT * FROM chat_histories WHERE id = $1 AND user_id = $2',
    [chatId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '대화 기록을 찾을 수 없습니다.' });
  }

  return res.status(200).json(result.rows[0]);
}

// 대화 기록 삭제
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  chatId: number
) {
  const result = await pool.query(
    'DELETE FROM chat_histories WHERE id = $1 AND user_id = $2 RETURNING *',
    [chatId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '대화 기록을 찾을 수 없습니다.' });
  }

  return res.status(200).json({ message: '대화 기록이 삭제되었습니다.' });
}

// 채팅 세션 제목 업데이트
async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  chatId: number
) {
  const { title } = req.body;

  console.log('title:', title);
  console.log('chatId:', chatId);
  console.log('userId:', userId);

  try {
    const result = await pool.query(
      'UPDATE chat_histories SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [title, chatId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update chat title error:', error);
    return res.status(500).json({ error: 'Failed to update chat title' });
  }
}
