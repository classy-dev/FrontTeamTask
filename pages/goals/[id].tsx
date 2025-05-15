import { useRouter } from 'next/router';
import { useGoals, useGoal } from '@/lib/hooks/useGoals';
import { GoalForm } from '@/components/goals/GoalForm';
import { useCategories } from '@/lib/hooks/useCategories';
import { CreateGoalInput, UpdateGoalInput } from '@/lib/types/goal';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { ArrowLeft } from '@mui/icons-material';
import { Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { createGoal } from '@/lib/api/goals';

export default function GoalDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { updateGoal, isUpdating } = useGoals();
  const { goal, isLoading } = useGoal(id && !Array.isArray(id) ? parseInt(id) : 0);
  const { categories = [], isLoadingCategories } = useCategories();

  const handleSubmit = async (data: UpdateGoalInput) => {
    try {
      await updateGoal(data as UpdateGoalInput);
      router.push('/');
    } catch (error) {
      console.error('Error submitting goal:', error);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  if (isLoadingCategories || isLoading) {
    return (
      <Layout>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!goal) {
    return (
      <Layout>
        <Container>
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={handleBack}
              startIcon={<ArrowLeft />}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              목록으로
            </Button>
          </Box>
          <Typography variant="h6" color="error">
            목표를 찾을 수 없습니다.
          </Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button onClick={handleBack} startIcon={<ArrowLeft />}>
            목록으로 돌아가기
          </Button>
        </Box>
        <Typography variant="h4" component="h1" gutterBottom>
          목표 수정
        </Typography>
        <GoalForm
          initialData={goal}
          onSubmit={(data: any) => handleSubmit(data)}
          isSubmitting={isUpdating}
          categories={categories}
        />
      </Container>
    </Layout>
  );
}
