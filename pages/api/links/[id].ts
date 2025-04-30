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
      return res.status(400).json({ message: '올바른 링크 ID가 필요합니다.' });
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
    console.error('Link API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 특정 링크 조회
async function handleGetOne(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  linkId: number
) {
  const result = await pool.query(
    'SELECT * FROM links WHERE id = $1 AND user_id = $2',
    [linkId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '링크를 찾을 수 없습니다.' });
  }

  return res.status(200).json(result.rows[0]);
}

// 링크 수정
async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  linkId: number
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

  // 링크 존재 여부 확인
  const existingLink = await pool.query(
    'SELECT * FROM links WHERE id = $1 AND user_id = $2',
    [linkId, userId]
  );

  if (existingLink.rows.length === 0) {
    return res.status(404).json({ message: '링크를 찾을 수 없습니다.' });
  }

  const result = await pool.query(
    `UPDATE links 
     SET site_name = $1, url = $2
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [site_name, url, linkId, userId]
  );

  return res.status(200).json(result.rows[0]);
}

// 링크 삭제
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  linkId: number
) {
  const result = await pool.query(
    'DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING *',
    [linkId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '링크를 찾을 수 없습니다.' });
  }

  return res.status(200).json({ message: '링크가 삭제되었습니다.' });
}
