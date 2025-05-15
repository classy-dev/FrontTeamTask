import { useRouter } from 'next/router';
import { useGoals } from '@/lib/hooks/useGoals';
import { GoalForm } from '@/components/goals/GoalForm';
import { useCategories } from '@/lib/hooks/useCategories';
import { CreateGoalInput, UpdateGoalInput } from '@/lib/types/goal';
import { Layout } from '@/components/layout';
import { Container, Typography } from '@mui/material';

export default function NewGoalPage() {
  const router = useRouter();
  const { createGoal, isCreating } = useGoals();
  const { categories = [], isLoadingCategories } = useCategories();

  const handleSubmit = async (data: CreateGoalInput) => {
    await createGoal(data);
    router.push('/');
  };

  if (isLoadingCategories) {
    return (
      <Layout>
        <Container>
          <Typography>카테고리 로딩 중...</Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          새 목표 추가
        </Typography>
        <GoalForm
          onSubmit={(data: any) => handleSubmit(data)}
          isSubmitting={isCreating}
          categories={categories || []}
        />
      </Container>
    </Layout>
  );
}
