import axios from 'axios';
import { Board, CreateBoardInput, UpdateBoardInput } from '../types/board';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 게시글 생성
export const createBoard = async (data: CreateBoardInput): Promise<Board> => {
  const response = await axios.post(`${API_URL}/api/boards`, data);
  return response.data;
};

// 게시글 목록 조회
export const getBoards = async (boardType: string): Promise<Board[]> => {
  const response = await axios.get(`${API_URL}/api/boards?type=${boardType}`);
  return response.data;
};

// 특정 게시글 조회
export const getBoard = async (id: number): Promise<Board> => {
  const response = await axios.get(`${API_URL}/api/boards/${id}`);
  return response.data;
};

// 게시글 수정
export const updateBoard = async (data: UpdateBoardInput): Promise<Board> => {
  const response = await axios.put(`${API_URL}/api/boards/${data.id}`, data);
  return response.data;
};

// 게시글 삭제
export const deleteBoard = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/boards/${id}`);
};
