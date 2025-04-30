import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface MonthlyGoal {
  id: number;
  title: string;
  target_year: number;
  target_month: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export function useMonthlyGoals(year: number, month: number) {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['monthlyGoals', year, month],
    queryFn: async () => {
      const response = await axios.get(`/api/monthly-goals?year=${year}&month=${month}`);
      return response.data;
    }
  });

  const { mutate: createGoal } = useMutation({
    mutationFn: async ({ 
      title, 
      targetYear, 
      targetMonth,
      memo 
    }: { 
      title: string; 
      targetYear: number; 
      targetMonth: number;
      memo?: string;
    }) => {
      const response = await axios.post('/api/monthly-goals', {
        title,
        targetYear,
        targetMonth,
        memo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyGoals', year, month] });
    },
  });

  const { mutate: updateGoal } = useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      targetYear, 
      targetMonth,
      memo
    }: { 
      id: number; 
      title: string; 
      targetYear: number; 
      targetMonth: number;
      memo?: string;
    }) => {
      const response = await axios.put('/api/monthly-goals', {
        id,
        title,
        targetYear,
        targetMonth,
        memo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyGoals', year, month] });
    },
  });

  const { mutate: deleteGoal } = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/monthly-goals?id=${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyGoals', year, month] });
    },
  });

  return {
    goals,
    isLoading,
    isError: !!error,
    createGoal: (title: string, targetYear: number, targetMonth: number, memo?: string) => 
      createGoal({ title, targetYear, targetMonth, memo }),
    updateGoal: (id: number, title: string, targetYear: number, targetMonth: number, memo?: string) => 
      updateGoal({ id, title, targetYear, targetMonth, memo }),
    deleteGoal,
  };
}
