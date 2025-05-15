import { NextApiRequest, NextApiResponse } from 'next';
import { GeminiService } from '@/lib/services/ai/gemini';
import { ChatMessage } from '@/lib/types/ai';

const SYSTEM_MESSAGE = {
  role: 'system',
  content: '당신은 목표 달성을 돕는 AI 어시스턴트입니다. 사용자의 목표 설정과 달성을 위해 구체적이고 실용적인 조언을 제공해주세요.'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model, stream = false } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required and must be an array' });
    }

    const processedMessages = [SYSTEM_MESSAGE, ...messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))];

    const service = GeminiService.getInstance();
    service.setModel(model);

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await service.chatStream(processedMessages);
      let buffer = '';

      for await (const chunk of stream) {
        const text = chunk.text();
        buffer += text;

        // 문장이 완성되었거나 버퍼가 일정 크기 이상이 되면 전송
        if (text.includes('.') || text.includes('!') || text.includes('?') || buffer.length > 50) {
          res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
          buffer = '';
        }
      }

      // 남은 버퍼가 있다면 전송
      if (buffer) {
        res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
      }

      res.end();
    } else {
      const content = await service.chat(processedMessages);
      return res.status(200).json({
        result: {
          content,
          role: 'assistant'
        }
      });
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
