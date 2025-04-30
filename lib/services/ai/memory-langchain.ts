import { BufferMemory } from 'langchain/memory';
import { ChatMessage } from '@/lib/types/ai';
import { LangChainService } from './langchain';

export class ChatMemoryManager {
  private messages: ChatMessage[] = [];
  private maxTokens: number;
  private service: LangChainService;

  constructor(maxTokens: number = 4000) {
    this.maxTokens = maxTokens;
    this.service = LangChainService.getInstance();
  }

  async addMessage(message: ChatMessage) {
    if (!message.content.trim()) {
      console.error('Cannot add empty message');
      return;
    }

    // 시스템 메시지는 항상 첫 번째로
    if (message.role === 'system') {
      this.messages = this.messages.filter(msg => msg.role !== 'system');
      this.messages.unshift(message);
    } else {
      this.messages.push(message);
    }

    // 메모리가 너무 커지면 요약
    const totalTokens = JSON.stringify(this.messages).length;
    if (totalTokens > this.maxTokens) {
      await this.summarizeAndCompact();
    }
  }

  async addMessages(messages: ChatMessage[]) {
    for (const message of messages) {
      await this.addMessage(message);
    }
  }

  async getMessages(): Promise<ChatMessage[]> {
    return this.messages;
  }

  private async summarizeAndCompact() {
    if (this.messages.length < 3) return;

    const summary = await this.service.summarizeChat(this.messages, 'gpt-4o-mini');
    const systemMessage = this.messages.find(msg => msg.role === 'system');

    this.messages = [
      ...(systemMessage ? [systemMessage] : []),
      { role: 'system', content: '이전 대화 요약: ' + summary },
      this.messages[this.messages.length - 2],
      this.messages[this.messages.length - 1],
    ];
  }

  async clear() {
    this.messages = [];
  }
}
