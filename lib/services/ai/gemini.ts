import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Tool,
} from "@google/generative-ai";
import { GeminiMemoryManager } from './gemini-memory';

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chatSession: any;
  private generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  private tools: Tool[] = [
    { googleSearch: {} } as Tool,
  ];
  private enableSearch: boolean = false;
  private systemInstruction?: string;
  private memoryManager: GeminiMemoryManager;

  private constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey || apiKey.length < 30) {  // Gemini API keys are typically longer
      throw new Error('Invalid or missing Gemini API key. Please check your environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.memoryManager = GeminiMemoryManager.getInstance();
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public setModel(modelName: string, systemInstruction?: string, enableSearch: boolean = false) {
    this.systemInstruction = systemInstruction;
    this.enableSearch = enableSearch;
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      ...(systemInstruction && { systemInstruction }),
      generationConfig: this.generationConfig,
      ...(enableSearch && { tools: this.tools }),
    });
    
    this.chatSession = null;
    this.memoryManager.setModel(this.model);
  }

  public async chat(messages: { role: string; content: string }[]) {
    try {
      if (!this.model) {
        throw new Error('Model not initialized. Call setModel first.');
      }

      // Convert all messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Initialize chat with all previous messages as history
      if (!this.chatSession) {
        this.chatSession = this.model.startChat({
          generationConfig: this.generationConfig,
          ...(this.enableSearch && { tools: this.tools }),
          history: geminiMessages.slice(0, -1), // All messages except the last one
        });
      }

      // Send the last message
      const lastMessage = geminiMessages[geminiMessages.length - 1];
      if (lastMessage) {
        const result = await this.chatSession.sendMessage(lastMessage.parts[0].text);
        const response = await result.response;
        const responseText = response.text();
        return responseText;
      }

      throw new Error('No message to send');
    } catch (error) {
      console.error('Error in Gemini chat:', error);
      throw error;
    }
  }

  public async chatStream(messages: { role: string; content: string }[]) {
    try {
      if (!this.model) {
        throw new Error('Model not initialized. Call setModel first.');
      }

      // Convert all messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Initialize chat with all previous messages as history
      if (!this.chatSession) {
        this.chatSession = this.model.startChat({
          generationConfig: this.generationConfig,
          ...(this.enableSearch && { tools: this.tools }),
          history: geminiMessages.slice(0, -1), // All messages except the last one
        });
      }

      // Send the last message
      const lastMessage = geminiMessages[geminiMessages.length - 1];
      if (lastMessage) {
        const result = await this.chatSession.sendMessageStream(lastMessage.parts[0].text);
        return result.stream;
      }

      throw new Error('No message to send');
    } catch (error) {
      console.error('Error in Gemini chat stream:', error);
      throw error;
    }
  }

  public resetChat() {
    this.chatSession = null;
  }
}
