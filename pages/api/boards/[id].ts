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
      return res.status(400).json({ message: '올바른 게시글 ID가 필요합니다.' });
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
    console.error('Board API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 특정 게시글 조회
async function handleGetOne(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  boardId: number
) {
  const result = await pool.query(
    'SELECT * FROM boards WHERE id = $1 AND user_id = $2',
    [boardId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }

  return res.status(200).json(result.rows[0]);
}

// 게시글 수정
async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  boardId: number
) {
  const {
    title,
    content,
    image_path,
    reflection_date,
    board_type
  } = req.body;

  // 게시글 존재 여부 확인
  const existingBoard = await pool.query(
    'SELECT * FROM boards WHERE id = $1 AND user_id = $2',
    [boardId, userId]
  );

  if (existingBoard.rows.length === 0) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }

  const updates = [];
  const values = [];
  let valueIndex = 1;

  // 동적으로 업데이트할 필드 생성
  if (title !== undefined) {
    updates.push(`title = $${valueIndex}`);
    values.push(title);
    valueIndex++;
  }
  if (content !== undefined) {
    updates.push(`content = $${valueIndex}`);
    values.push(content);
    valueIndex++;
  }
  if (image_path !== undefined) {
    updates.push(`image_path = $${valueIndex}`);
    values.push(image_path);
    valueIndex++;
  }
  if (reflection_date !== undefined) {
    updates.push(`reflection_date = $${valueIndex}`);
    values.push(reflection_date);
    valueIndex++;
  }
  if (board_type !== undefined) {
    updates.push(`board_type = $${valueIndex}`);
    values.push(board_type);
    valueIndex++;
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: '업데이트할 내용이 없습니다.' });
  }

  // WHERE 절에 필요한 값들 추가
  values.push(boardId);
  values.push(userId);

  const result = await pool.query(
    `UPDATE boards 
     SET ${updates.join(', ')}
     WHERE id = $${valueIndex} AND user_id = $${valueIndex + 1}
     RETURNING *`,
    values
  );

  return res.status(200).json(result.rows[0]);
}

// 게시글 삭제
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  boardId: number
) {
  const result = await pool.query(
    'DELETE FROM boards WHERE id = $1 AND user_id = $2 RETURNING *',
    [boardId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }

  return res.status(200).json({ message: '게시글이 삭제되었습니다.' });
}
