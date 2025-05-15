import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  AIMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatMessage, ModelType } from '@/lib/types/ai';
import { Goal } from '@/lib/types/goal';

export class LangChainService {
  private static instance: LangChainService;
  private models: Map<string, any> = new Map();

  private constructor() {
    try {
      // OpenAI 모델 초기화
      if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        console.log('Initializing OpenAI models...');
        this.models.set('gpt-4o', new ChatOpenAI({
          modelName: 'gpt-4o',
          temperature: 0.7,
          streaming: true,
          openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        }));
        this.models.set('gpt-4o-mini', new ChatOpenAI({
          modelName: 'gpt-4o-mini',
          temperature: 0.7,
          streaming: true,
          openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        }));
        console.log('OpenAI models initialized');
      } else {
        console.log('NEXT_PUBLIC_OPENAI_API_KEY not found');
      }

      // Anthropic 모델 초기화
      if (process.env.ANTHROPIC_API_KEY) {
        console.log('Initializing Anthropic models...');
        this.models.set('claude-3-haiku-20240307', new ChatAnthropic({
          modelName: 'claude-3-haiku-20240307',
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        }));
        this.models.set('claude-3-5-sonnet-20240620', new ChatAnthropic({
          modelName: 'claude-3-5-sonnet-20240620',
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        }));
        console.log('Anthropic models initialized');
      } else {
        console.log('ANTHROPIC_API_KEY not found');
      }
    } catch (error) {
      console.error('Error initializing LangChain service:', error);
    }
  }

  public static getInstance(): LangChainService {
    if (!LangChainService.instance) {
      LangChainService.instance = new LangChainService();
    }
    return LangChainService.instance;
  }

  private getModel(modelName: ModelType) {
    const model = this.models.get(modelName);
    if (!model) {
      console.error('Model not found:', modelName);
      console.error('Available models:', Array.from(this.models.keys()));
      throw new Error(`Model ${modelName} is not configured`);
    }
    return model;
  }

  async chat(
    messages: ChatMessage[],
    modelName: ModelType,
  ): Promise<string> {
    try {
      console.log('Using model:', modelName);
      console.log('Messages:', messages);
      
      const model = this.getModel(modelName);

      // 시스템 메시지와 사용자 메시지 분리
      const systemMessage = messages.find(msg => msg.role === 'system')?.content || 
        `당신은 목표 달성을 돕는 AI 어시스턴트입니다. 
        사용자의 목표 설정과 달성을 위해 구체적이고 실용적인 조언을 제공해주세요.`;

      // 사용자와 어시스턴트 메시지만 필터링
      const chatMessages = messages
        .filter(msg => msg.role !== 'system' && msg.content.trim())
        .map(msg => ({
          type: msg.role === 'user' ? 'human' : 'assistant',
          content: msg.content.trim(),
        }));

      // 마지막 메시지가 있는지 확인
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || !lastMessage.content.trim()) {
        console.error('Last message is empty or missing');
        throw new Error('Message content cannot be empty');
      }

      // 메시지 유효성 검사
      if (chatMessages.length === 0) {
        console.error('No valid messages found');
        throw new Error('No valid messages found');
      }

      // 프롬프트 구성
      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemMessage),
        ...chatMessages.map(msg => 
          msg.type === 'human' 
            ? HumanMessagePromptTemplate.fromTemplate(msg.content)
            : AIMessagePromptTemplate.fromTemplate(msg.content)
        )
      ]);

      const chain = RunnableSequence.from([
        prompt,
        model,
        new StringOutputParser(),
      ]);

      const response = await chain.invoke({
        messages: chatMessages,
        systemMessage
      });

      if (!response) {
        throw new Error('AI 응답이 비어있습니다.');
      }

      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  async summarizeChat(messages: ChatMessage[], modelName: ModelType): Promise<string> {
    try {
      const model = this.getModel(modelName);

      const systemMessage = `이전 대화를 간단히 요약해주세요. 
        주요 주제와 결정사항을 중심으로 요약해주세요.`;

      const chatMessages = messages
        .filter(msg => msg.content.trim())
        .map(msg => ({
          type: msg.role === 'user' ? 'human' : 'assistant',
          content: msg.content.trim(),
        }));

      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemMessage),
        ...chatMessages.map(msg => 
          msg.type === 'human' 
            ? HumanMessagePromptTemplate.fromTemplate(msg.content)
            : AIMessagePromptTemplate.fromTemplate(msg.content)
        )
      ]);

      const chain = RunnableSequence.from([
        prompt,
        model,
        new StringOutputParser(),
      ]);

      const response = await chain.invoke({
        messages: chatMessages,
        systemMessage
      });

      if (!response) {
        throw new Error('요약 생성에 실패했습니다.');
      }

      return response;
    } catch (error) {
      console.error('Error in summarizeChat:', error);
      throw error;
    }
  }
}
