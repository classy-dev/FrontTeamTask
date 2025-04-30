import axios from 'axios';
import { Link, CreateLinkInput, UpdateLinkInput } from '../types/board';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 링크 생성
export const createLink = async (data: CreateLinkInput): Promise<Link> => {
  const response = await axios.post(`${API_URL}/api/links`, data);
  return response.data;
};

// 링크 목록 조회
export const getLinks = async (): Promise<Link[]> => {
  const response = await axios.get(`${API_URL}/api/links`);
  return response.data;
};

// 특정 링크 조회
export const getLink = async (id: number): Promise<Link> => {
  const response = await axios.get(`${API_URL}/api/links/${id}`);
  return response.data;
};

// 링크 수정
export const updateLink = async (data: UpdateLinkInput): Promise<Link> => {
  const response = await axios.put(`${API_URL}/api/links/${data.id}`, data);
  return response.data;
};

// 링크 삭제
export const deleteLink = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/links/${id}`);
};
