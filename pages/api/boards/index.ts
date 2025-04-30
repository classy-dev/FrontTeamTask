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
    console.error('Boards API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 게시글 생성
async function handleCreate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const {
    title,
    content,
    image_path,
    board_type,
    reflection_date
  } = req.body;

  if (!title || !board_type) {
    return res.status(400).json({ message: '제목과 게시판 종류는 필수입니다.' });
  }

  // 게시판 종류 검증
  if (!['info', 'idea', 'reflection', 'wedding', 'dailyMission'].includes(board_type)) {
    return res.status(400).json({ message: '올바른 게시판 종류가 아닙니다.' });
  }

  const result = await pool.query(
    `INSERT INTO boards (
      user_id,
      title,
      content,
      image_path,
      board_type,
      reflection_date
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [userId, title, content, image_path, board_type, reflection_date]
  );

  return res.status(201).json(result.rows[0]);
}

// 게시글 목록 조회
async function handleGetAll(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const { type } = req.query;

  if (!type || !['info', 'idea', 'reflection', 'wedding', 'dailyMission'].includes(type as string)) {
    return res.status(400).json({ message: '올바른 게시판 종류가 필요합니다.' });
  }

  const result = await pool.query(
    `SELECT *
     FROM boards
     WHERE user_id = $1 AND board_type = $2
     ORDER BY created_at DESC`,
    [userId, type]
  );

  return res.status(200).json(result.rows);
}
