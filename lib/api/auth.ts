import axios from 'axios';
import { LoginInput, RegisterInput, AuthResponse } from '../types/auth';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data);
  return response.data;
};

export const register = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/register`, data);
  return response.data;
};

export const logout = () => {
  Cookies.remove('token');
  localStorage.removeItem('user');
  axios.defaults.headers.common['Authorization'] = '';
};

export const setAuthToken = (token: string) => {
  Cookies.set('token', token, { expires: 7 }); // 7일 동안 유효
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('token') || null;
};

export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
