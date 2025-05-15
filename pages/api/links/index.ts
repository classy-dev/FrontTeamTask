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
    console.error('Links API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 링크 생성
async function handleCreate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const { site_name, url } = req.body;

  if (!site_name || !url) {
    return res.status(400).json({ message: '사이트 이름과 URL은 필수입니다.' });
  }

  // URL 형식 검증
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ message: '올바른 URL 형식이 아닙니다.' });
  }

  const result = await pool.query(
    `INSERT INTO links (
      user_id,
      site_name,
      url
    ) VALUES ($1, $2, $3)
    RETURNING *`,
    [userId, site_name, url]
  );

  return res.status(201).json(result.rows[0]);
}

// 링크 목록 조회
async function handleGetAll(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const result = await pool.query(
    `SELECT *
     FROM links
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return res.status(200).json(result.rows);
}
