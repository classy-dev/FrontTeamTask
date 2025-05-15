import axios from 'axios';
import { CreateGoalInput, Goal, UpdateGoalInput } from '../types/goal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 목표 생성
export const createGoal = async (data: CreateGoalInput): Promise<Goal> => {
  const response = await axios.post(`${API_URL}/api/goals`, data);
  return response.data;
};

// 목표 목록 조회
export const getGoals = async (params?: string): Promise<Goal[]> => {
  const response = await axios.get(`${API_URL}/api/goals${params ? `?${params}` : ''}`);
  return response.data;
};

// 특정 목표 조회
export const getGoal = async (id: number): Promise<Goal> => {
  const response = await axios.get(`${API_URL}/api/goals/${id}`);
  return response.data;
};

// 목표 수정
export const updateGoal = async (data: UpdateGoalInput): Promise<Goal> => {
  const response = await axios.put(`${API_URL}/api/goals/${data.id}`, data);
  return response.data;
};

// 목표 삭제
export const deleteGoal = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/goals/${id}`);
};

// 오늘의 목표 조회
export const getTodayGoals = async (): Promise<Goal[]> => {
  const response = await axios.get(`${API_URL}/api/goals/today`);
  return response.data;
};

// 미완료 목표 조회
export const getIncompleteGoals = async (): Promise<Goal[]> => {
  const response = await axios.get(`${API_URL}/api/goals/incomplete`);
  return response.data;
};
