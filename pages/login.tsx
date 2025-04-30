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
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import { LoginInput } from '../lib/types/auth';
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

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>();
  const { login, isLoading } = useAuth();

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h5">
          로그인
        </Typography>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="이메일"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          <Box textAlign="center">
            <Link
              href="/register"
              style={{
                textDecoration: 'none',
                color: 'primary.main'
              }}
            >
              <Typography variant="body2">
                계정이 없으신가요? 회원가입
              </Typography>
            </Link>
          </Box>
        </StyledForm>
      </StyledPaper>
    </Container>
  );
}
