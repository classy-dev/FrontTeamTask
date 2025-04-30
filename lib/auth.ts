import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import pool from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: number;
  email: string;
}

export async function getAuthUser(req: NextApiRequest) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return null;
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 사용자 정보 조회
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
