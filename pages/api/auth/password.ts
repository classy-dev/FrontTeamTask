import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // 새 비밀번호 확인
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "새 비밀번호가 일치하지 않습니다." });
    }

    // 현재 사용자 정보 조회
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 현재 비밀번호 확인
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      userResult.rows[0].password
    );

    if (!isValidPassword) {
      return res
        .status(400)
        .json({ message: "현재 비밀번호가 올바르지 않습니다." });
    }

    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error("Password change error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    res.status(500).json({
      message: "비밀번호 변경 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
