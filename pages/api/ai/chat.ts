import { NextApiRequest, NextApiResponse } from 'next';
import { LangChainService } from '@/lib/services/ai/langchain';
import { ChatMessage, ModelType } from '@/lib/types/ai';
import { generateSystemMessage } from '@/lib/utils/systemMessage';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Goal, Category } from '@/lib/types/goal';
import { startOfDay, endOfDay } from 'date-fns';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages, model } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: '올바른 메시지 형식이 아닙니다.' });
    }

    // 사용자 인증
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // 사용자 프로필 조회
    // const profileResult = await pool.query(
    //   'SELECT content, consultant_style FROM user_profiles WHERE user_id = $1',
    //   [authUser.id]
    // );
    // const profile = profileResult.rows[0] || {};

    // 오늘의 목표 조회
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const todaysGoalsResult = await pool.query<Goal>(
      `SELECT * FROM goals 
       WHERE user_id = $1 
       AND start_date >= $2 
       AND end_date <= $3 
       AND status != '완료'
       ORDER BY start_date ASC`,
      [authUser.id, todayStart, todayEnd]
    );

    // 미완료 목표 조회
    const incompleteGoalsResult = await pool.query<Goal>(
      `SELECT * FROM goals 
       WHERE user_id = $1 
       AND status != '완료' 
       AND end_date < $2
       ORDER BY end_date ASC`,
      [authUser.id, todayStart]
    );

    // 카테고리 조회
    const categoriesResult = await pool.query<Category>(
      'SELECT * FROM categories WHERE user_id = $1',
      [authUser.id]
    );

    // 시스템 메시지 생성
    const systemMessageContent = generateSystemMessage(
      todaysGoalsResult.rows,
      incompleteGoalsResult.rows,
      categoriesResult.rows
    );

    // 메시지가 비어있다면 시스템 메시지만 반환
    if (messages.length === 0) {
      return res.status(200).json({ 
        systemMessage: systemMessageContent
      });
    }

    // 중복 메시지 제거 및 메시지 유효성 검사
    const uniqueMessages = messages.filter((message, index, self) =>
      index === self.findIndex((m) => m.content === message.content)
    );

    // 시스템 메시지는 더 이상 메시지 배열에 포함하지 않음
    const processedMessages = uniqueMessages;

    const service = LangChainService.getInstance();
    const content = await service.chat(processedMessages, model as ModelType);
    
    return res.status(200).json({ content });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      message: '채팅 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}