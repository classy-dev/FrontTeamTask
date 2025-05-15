import axios from 'axios';
import { GoalAnalysis, GoalAnalysisInput } from '../types/goal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 목표 분석 생성
export const createAnalysis = async (data: GoalAnalysisInput): Promise<GoalAnalysis> => {
  const response = await axios.post(`${API_URL}/api/analyses`, data);
  return response.data;
};

// 목표 분석 목록 조회
export const getAnalyses = async (period?: string): Promise<GoalAnalysis[]> => {
  const url = period 
    ? `${API_URL}/api/analyses?period=${period}`
    : `${API_URL}/api/analyses`;
  const response = await axios.get(url);
  return response.data;
};

// 특정 목표 분석 조회
export const getAnalysis = async (id: number): Promise<GoalAnalysis> => {
  const response = await axios.get(`${API_URL}/api/analyses/${id}`);
  return response.data;
};

// 오늘의 목표 분석
export const analyzeTodayGoals = async (): Promise<GoalAnalysis> => {
  const response = await axios.post(`${API_URL}/api/analyses/today`);
  return response.data;
};

// 기간별 목표 분석
export const analyzeGoalsByPeriod = async (period: string): Promise<GoalAnalysis> => {
  const response = await axios.post(`${API_URL}/api/analyses/period/${period}`);
  return response.data;
};

// 미완료 목표 분석
export const analyzeIncompleteGoals = async (): Promise<GoalAnalysis> => {
  const response = await axios.post(`${API_URL}/api/analyses/incomplete`);
  return response.data;
};
