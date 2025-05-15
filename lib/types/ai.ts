import { Goal } from "./goal";

export type ModelType =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-3-5-sonnet-20240620"
  | "claude-3-haiku-20240307"
  | "gemini-2.5-flash-preview-04-17"
  | "gemini-exp-1206";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatHistory {
  id: number;
  userId: number;
  messages: ChatMessage[];
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalAnalysis {
  id: number;
  userId: number;
  goals: Goal[];
  analysis: string;
  recommendations: string[];
  createdAt: Date;
}

export interface SearchResult {
  query: string;
  results: string;
  source: "perplexity";
  timestamp: Date;
}

export interface AIConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  perplexityApiKey?: string;
  defaultModel: ModelType;
}
