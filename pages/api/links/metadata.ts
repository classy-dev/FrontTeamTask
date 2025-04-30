import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUser } from '@/lib/auth';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL이 필요합니다.' });
    }

    // URL 메타데이터 가져오기
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // 타이틀 가져오기 (우선순위: Open Graph > 메타 타이틀 > HTML 타이틀)
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('title').text() ||
      '';

    // 설명 가져오기
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // 이미지 URL 가져오기
    const imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="image"]').attr('content') ||
      '';

    return res.status(200).json({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    });
  } catch (error) {
    console.error('Link metadata error:', error);
    return res.status(500).json({
      message: '메타데이터를 가져오는데 실패했습니다.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
