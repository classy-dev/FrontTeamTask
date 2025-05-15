import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import { RegisterInput } from '../lib/types/auth';
import { useAuth } from '../lib/hooks/useAuth';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

export default function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterInput & { confirmPassword: string }>();
  const { register: registerUser, isLoading, error } = useAuth();
  const password = watch('password');

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h5">
          회원가입
        </Typography>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              회원가입 중 오류가 발생했습니다.
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="사용자 이름"
            autoComplete="name"
            autoFocus
            {...register('username', {
              required: '사용자 이름을 입력해주세요',
              minLength: {
                value: 2,
                message: '사용자 이름은 최소 2자 이상이어야 합니다',
              },
            })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="이메일"
            autoComplete="email"
            {...register('email', {
              required: '이메일을 입력해주세요',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '올바른 이메일 주소를 입력해주세요',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="비밀번호"
            type="password"
            id="password"
            {...register('password', {
              required: '비밀번호를 입력해주세요',
              minLength: {
                value: 6,
                message: '비밀번호는 최소 6자 이상이어야 합니다',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="비밀번호 확인"
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', {
              required: '비밀번호 확인을 입력해주세요',
              validate: value =>
                value === password || '비밀번호가 일치하지 않습니다',
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? '회원가입 중...' : '회원가입'}
          </Button>
          <Box textAlign="center">
            <Link
              href="/login"
              style={{
                textDecoration: 'none',
                color: 'primary.main'
              }}
            >
              <Typography variant="body2">
                이미 계정이 있으신가요? 로그인
              </Typography>
            </Link>
          </Box>
        </StyledForm>
      </StyledPaper>
    </Container>
  );
}
