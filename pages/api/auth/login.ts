import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // 사용자 조회
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    console.log('Login attempt:', {
      email,
      providedPassword: password,
      storedPassword: user.password,
    });

    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 비밀번호 제외하고 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}
