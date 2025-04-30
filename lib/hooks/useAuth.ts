import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi, register as registerApi, logout as logoutApi, setAuthToken, setUser } from '../api/auth';
import { LoginInput, RegisterInput } from '../types/auth';
import { showSuccess } from '../utils/error';

export const useAuth = () => {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAuthToken(data.token);
      setUser(data.user);
      showSuccess('로그인되었습니다.');
      // 약간의 지연 후 리다이렉트
      setTimeout(() => {
        router.push('/');
      }, 500);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setAuthToken(data.token);
      setUser(data.user);
      showSuccess('회원가입이 완료되었습니다.');
      setTimeout(() => {
        router.push('/');
      }, 500);
    },
  });

  const login = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  const register = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  const logout = () => {
    logoutApi();
    showSuccess('로그아웃되었습니다.');
    router.push('/login');
  };

  return {
    login,
    register,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  };
};
