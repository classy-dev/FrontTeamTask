import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
}

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || '서버 오류가 발생했습니다.';
    toast.error(message);
    return message;
  }
  
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
  toast.error(message);
  return message;
};

export const showSuccess = (message: string) => {
  toast.success(message);
};
