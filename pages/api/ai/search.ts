import { NextApiRequest, NextApiResponse } from 'next';
import { PerplexityService } from '@/lib/services/ai/perplexity';
import { getAuthUser } from '@/lib/auth';

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is not configured');
}

const searchService = new PerplexityService(process.env.PERPLEXITY_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { query } = req.body;

    if (typeof query !== 'string') {
      return res.status(400).json({ message: '올바른 검색어 형식이 아닙니다.' });
    }

    // 검색 수행
    const searchResult = await searchService.search(query);

    return res.status(200).json(searchResult);
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
