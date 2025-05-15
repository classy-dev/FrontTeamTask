import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface LongTermGoal {
  id: number;
  title: string;
  target_year: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export function useLongTermGoals(year: number) {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['longTermGoals', year],
    queryFn: async () => {
      const response = await axios.get(`/api/long-term-goals?year=${year}`);
      return response.data;
    }
  });

  const { mutate: createGoal } = useMutation({
    mutationFn: async ({ title, targetYear, memo }: { title: string; targetYear: number; memo?: string }) => {
      const response = await axios.post('/api/long-term-goals', {
        title,
        targetYear,
        memo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['longTermGoals', year] });
    },
  });

  const { mutate: updateGoal } = useMutation({
    mutationFn: async ({ id, title, targetYear, memo }: { id: number; title: string; targetYear: number; memo?: string }) => {
      const response = await axios.put('/api/long-term-goals', {
        id,
        title,
        targetYear,
        memo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['longTermGoals', year] });
    },
  });

  const { mutate: deleteGoal } = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/long-term-goals?id=${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['longTermGoals', year] });
    },
  });

  return {
    goals,
    isLoading,
    isError: !!error,
    createGoal: (title: string, targetYear: number, memo?: string) => createGoal({ title, targetYear, memo }),
    updateGoal: (id: number, title: string, targetYear: number, memo?: string) => updateGoal({ id, title, targetYear, memo }),
    deleteGoal,
  };
}
