import { SearchResult } from '@/lib/types/ai';

export class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<SearchResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: '당신은 검색 전문가입니다. 사용자의 검색어에 대해 최신의 정확한 정보를 제공합니다. 답변은 명확하고 구체적이어야 하며, 가능한 한 최신 정보를 포함해야 합니다.'
          },
          {
            role: 'user',
            content: `다음 주제에 대해 최신 정보를 알려주세요: ${query}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Perplexity API request failed');
    }

    const data = await response.json();
    
    return {
      query,
      results: data.choices[0].message.content,
      source: 'perplexity',
      timestamp: new Date()
    };
  }
}
