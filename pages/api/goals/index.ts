import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { getAuthUser } from '../../../lib/auth';
import { format, addDays, addMonths, addYears } from 'date-fns';

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
    console.error('Goals API error:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 목표 생성
async function handleCreate(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const {
    title,
    start_date,
    start_time,
    end_date,
    end_time,
    trigger_action,
    importance = 5,
    memo = '',
    status = '진행 전',
    category_id
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: '목표 제목은 필수입니다.' });
  }

  // 날짜와 시간을 결합하여 타임스탬프 생성
  const startDateTime = start_date && start_time 
    ? new Date(`${start_date}T${start_time}:00`) 
    : start_date 
      ? new Date(start_date) 
      : null;

  const endDateTime = end_date && end_time 
    ? new Date(`${end_date}T${end_time}:00`) 
    : end_date 
      ? new Date(end_date) 
      : null;

  const result = await pool.query(
    `INSERT INTO goals (
      user_id,
      title,
      start_date,
      end_date,
      trigger_action,
      importance,
      memo,
      status,
      category_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      userId,
      title,
      startDateTime,
      endDateTime,
      trigger_action,
      importance,
      memo,
      status,
      category_id
    ]
  );

  return res.status(201).json(result.rows[0]);
}

// 목표 목록 조회
async function handleGetAll(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: number
) {
  const { date, view } = req.query;
  const targetDate = date ? new Date(date as string) : new Date();
  let endDate = new Date(targetDate);

  // 시작일과 종료일 설정
  switch(view) {
    case 'today':
      // 당일의 시작과 끝
      targetDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'tomorrow':
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'after2days':
      targetDate.setDate(targetDate.getDate() + 2);
      targetDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'after3days':
      targetDate.setDate(targetDate.getDate() + 3);
      targetDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      // 현재 날짜를 종료일로, 7일 전을 시작일로 설정
      endDate.setHours(23, 59, 59, 999);
      targetDate.setDate(targetDate.getDate() - 7);
      targetDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      // 현재 날짜를 종료일로, 한 달 전을 시작일로 설정
      endDate.setHours(23, 59, 59, 999);
      targetDate.setMonth(targetDate.getMonth() - 1);
      targetDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      targetDate.setHours(0, 0, 0, 0);
      endDate = addYears(targetDate, 1);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  // 캐시 방지를 위한 헤더 설정
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT g.*, c.name as category_name
         FROM goals g
         LEFT JOIN categories c ON g.category_id = c.id
         WHERE g.user_id = $1
         AND (
           (g.start_date >= $2 AND g.start_date <= $3)
           OR (g.end_date >= $2 AND g.end_date <= $3)
           OR (g.start_date <= $2 AND g.end_date >= $3)
         )
         ORDER BY g.start_date ASC`,
        [userId, targetDate.toISOString(), endDate.toISOString()]
      );
      
      return res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching goals:', error);
    return res.status(500).json({ 
      message: '목표 목록을 가져오는데 실패했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
