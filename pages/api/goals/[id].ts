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
      return res.status(400).json({ message: '올바른 목표 ID가 필요합니다.' });
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
    console.error('Goal API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 특정 목표 조회
async function handleGetOne(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  goalId: number
) {
  const result = await pool.query(
    `SELECT g.*, c.name as category_name
     FROM goals g
     LEFT JOIN categories c ON g.category_id = c.id
     WHERE g.id = $1 AND g.user_id = $2`,
    [goalId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '목표를 찾을 수 없습니다.' });
  }

  return res.status(200).json(result.rows[0]);
}

// 목표 수정
async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  goalId: number
) {
  const {
    title,
    start_date,
    end_date,
    trigger_action,
    importance,
    memo,
    status,
    category_id
  } = req.body;

  // 목표 존재 여부 확인
  const existingGoal = await pool.query(
    'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
    [goalId, userId]
  );

  if (existingGoal.rows.length === 0) {
    return res.status(404).json({ message: '목표를 찾을 수 없습니다.' });
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
  if (start_date !== undefined) {
    updates.push(`start_date = $${valueIndex}::timestamptz`);
    values.push(start_date);
    valueIndex++;
  }
  if (end_date !== undefined) {
    updates.push(`end_date = $${valueIndex}::timestamptz`);
    values.push(end_date);
    valueIndex++;
  }
  if (trigger_action !== undefined) {
    updates.push(`trigger_action = $${valueIndex}`);
    values.push(trigger_action);
    valueIndex++;
  }
  if (importance !== undefined) {
    updates.push(`importance = $${valueIndex}`);
    values.push(importance);
    valueIndex++;
  }
  if (memo !== undefined) {
    updates.push(`memo = $${valueIndex}`);
    values.push(memo);
    valueIndex++;
  }
  if (status !== undefined) {
    updates.push(`status = $${valueIndex}`);
    values.push(status);
    valueIndex++;
  }
  if (category_id !== undefined) {
    updates.push(`category_id = $${valueIndex}`);
    values.push(category_id);
    valueIndex++;
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  if (updates.length === 0) {
    return res.status(400).json({ message: '업데이트할 내용이 없습니다.' });
  }

  // WHERE 절에 필요한 값들 추가
  values.push(goalId);
  values.push(userId);

  const result = await pool.query(
    `UPDATE goals 
     SET ${updates.join(', ')}
     WHERE id = $${valueIndex} AND user_id = $${valueIndex + 1}
     RETURNING *`,
    values
  );

  return res.status(200).json(result.rows[0]);
}

// 목표 삭제
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number,
  goalId: number
) {
  const result = await pool.query(
    'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *',
    [goalId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: '목표를 찾을 수 없습니다.' });
  }

  return res.status(200).json({ message: '목표가 삭제되었습니다.' });
}
