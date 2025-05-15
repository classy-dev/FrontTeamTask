import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface WeeklyGoal {
  id: number;
  title: string;
  target_year: number;
  target_month: number;
  target_week: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export function useWeeklyGoals(year: number, month: number, week: number) {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['weeklyGoals', year, month, week],
    queryFn: async () => {
      const response = await axios.get(`/api/weekly-goals?year=${year}&month=${month}&week=${week}`);
      return response.data;
    }
  });

  const { mutate: createGoal } = useMutation({
    mutationFn: async ({ 
      title, 
      targetYear,
      targetMonth,
      targetWeek,
      memo 
    }: { 
      title: string; 
      targetYear: number;
      targetMonth: number;
      targetWeek: number;
      memo?: string;
    }) => {
      const response = await axios.post('/api/weekly-goals', {
        title,
        targetYear,
        targetMonth,
        targetWeek,
        memo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyGoals', year, month, week] });
    },
  });

  const { mutate: updateGoal } = useMutation({
    mutationFn: async ({
      id,
      title,
      targetYear,
      targetMonth,
      targetWeek,
      memo,
    }: {
      id: number;
      title: string;
      targetYear: number;
      targetMonth: number;
      targetWeek: number;
      memo?: string;
    }) => {
      const response = await axios.put(`/api/weekly-goals/${id}`, {
        title,
        targetYear,
        targetMonth,
        targetWeek,
        memo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyGoals', year, month, week] });
    },
  });

  const { mutate: deleteGoal } = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/weekly-goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyGoals', year, month, week] });
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
