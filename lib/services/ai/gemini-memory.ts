import type { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: string;
  parts: { text: string }[];
}

interface MemoryState {
  summary: string;
  recentMessages: ChatMessage[];
}

export class GeminiMemoryManager {
  private static instance: GeminiMemoryManager;
  private maxStackSize: number;
  private state: MemoryState;
  private model: any;

  private constructor(maxStackSize: number = 10) {
    this.maxStackSize = maxStackSize;
    this.state = {
      summary: "",
      recentMessages: []
    };
  }

  public static getInstance(maxStackSize?: number): GeminiMemoryManager {
    if (!GeminiMemoryManager.instance) {
      GeminiMemoryManager.instance = new GeminiMemoryManager(maxStackSize);
    }
    return GeminiMemoryManager.instance;
  }

  public setModel(model: any) {
    this.model = model;
  }

  private async summarizeMessages(messages: ChatMessage[]): Promise<string> {
    if (!this.model) {
      console.warn('Model not set in MemoryManager');
      return this.state.summary;
    }

    const conversationText = messages
      .map(msg => `${msg.role}: ${msg.parts[0].text}`)
      .join('\n');

    const summaryPrompt = `
이전 요약: ${this.state.summary}

새로운 대화:
${conversationText}

위 대화의 핵심 내용을 간단히 요약해주세요. 이전 요약이 있다면 그 내용도 고려하여 전체 맥락이 유지되도록 해주세요.
요약은 3문장 이내로 작성해주세요.`;

    try {
      const chat = this.model.startChat();
      const result = await chat.sendMessage(summaryPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Error summarizing messages:', error);
      return this.state.summary;
    }
  }

  public async addMessage(message: ChatMessage): Promise<void> {
    this.state.recentMessages.push(message);

    if (this.state.recentMessages.length >= this.maxStackSize) {
      const messagesToSummarize = this.state.recentMessages.slice(0, -1);
      const newSummary = await this.summarizeMessages(messagesToSummarize);
      
      this.state = {
        summary: newSummary,
        recentMessages: [this.state.recentMessages[this.state.recentMessages.length - 1]]
      };
    }
  }

  public getContext(): MemoryState {
    return this.state;
  }

  public reset(): void {
    this.state = {
      summary: "",
      recentMessages: []
    };
  }

  public estimateTokenCount(): number {
    const summaryTokens = this.state.summary.split(/\s+/).length;
    const messageTokens = this.state.recentMessages.reduce((acc, msg) => {
      return acc + msg.parts[0].text.split(/\s+/).length;
    }, 0);
    return summaryTokens + messageTokens;
  }
}
