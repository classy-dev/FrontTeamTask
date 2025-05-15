import axios from 'axios';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/goal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 카테고리 생성
export const createCategory = async (data: CreateCategoryInput): Promise<Category> => {
  const response = await axios.post(`${API_URL}/api/categories`, data);
  return response.data;
};

// 카테고리 목록 조회
export const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get(`${API_URL}/api/categories`);
  return response.data;
};

// 특정 카테고리 조회
export const getCategory = async (id: number): Promise<Category> => {
  const response = await axios.get(`${API_URL}/api/categories/${id}`);
  return response.data;
};

// 카테고리 수정
export const updateCategory = async (data: UpdateCategoryInput): Promise<Category> => {
  const response = await axios.put(`${API_URL}/api/categories/${data.id}`, data);
  return response.data;
};

// 카테고리 삭제
export const deleteCategory = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/categories/${id}`);
};
