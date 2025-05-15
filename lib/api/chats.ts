import axios from 'axios';
import { ChatHistory, CreateChatHistoryInput } from '../types/board';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 대화 기록 생성
export const createChatHistory = async (data: CreateChatHistoryInput): Promise<ChatHistory> => {
  const response = await axios.post(`${API_URL}/api/chats`, data);
  return response.data;
};

// 대화 기록 목록 조회
export const getChatHistories = async (): Promise<ChatHistory[]> => {
  const response = await axios.get(`${API_URL}/api/chats`);
  return response.data;
};

// 특정 대화 기록 조회
export const getChatHistory = async (id: number): Promise<ChatHistory> => {
  const response = await axios.get(`${API_URL}/api/chats/${id}`);
  return response.data;
};

// 대화 기록 삭제
export const deleteChatHistory = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/chats/${id}`);
};
