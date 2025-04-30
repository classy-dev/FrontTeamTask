import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Goal, CreateGoalInput, UpdateGoalInput } from '../types/goal';
import * as api from '../api/goals';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export type ViewType = 'today' | 'tomorrow' | 'after2days' | 'after3days' | 'week' | 'month' | 'year';

export function useGoals(date?: Date, view?: ViewType) {
  const queryClient = useQueryClient();

  const fetchGoals = async () => {
    const params = new URLSearchParams();
    if (date) {
      // UTC 시간으로 변환하여 날짜 포맷
      const utcDate = new Date(date.getTime() - (9 * 60 * 60 * 1000));
      params.append('date', format(utcDate, 'yyyy-MM-dd'));
    }
    if (view) {
      params.append('view', view);
    }
    
    return api.getGoals(params.toString());
  };

  const { data: goals = [], isLoading: isLoadingGoals } = useQuery({
    queryKey: ['goals', date?.toISOString(), view],
    queryFn: fetchGoals,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  const { mutate: updateGoal, isPending: isUpdating } = useMutation({
    mutationFn: async (data: UpdateGoalInput) => {
      const response = await api.updateGoal(data);
      return response;
    },
    onSuccess: () => {
      // 캐시를 완전히 제거하여 새로운 데이터를 강제로 가져오게 함
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('목표가 수정되었습니다.');
    },
    onError: (error) => {
      toast.error('목표 수정 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'));
    },
  });

  const { mutate: deleteGoal, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      await api.deleteGoal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('목표가 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error('목표 삭제 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'));
    },
  });

  const { mutate: createGoal, isPending: isCreating } = useMutation({
    mutationFn: async (data: CreateGoalInput) => {
       await api.createGoal(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('목표가 생성되었습니다.');
    },
    onError: (error) => {
      toast.error('목표 생성 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'));
    },
  });

  return {
    goals,
    isLoadingGoals,
    updateGoal,
    deleteGoal,
    createGoal,
    isUpdating,
    isDeleting,
    isCreating,
  };
}

// 특정 목표 조회를 위한 hook
export function useGoal(id: number) {
  const { data: goal, isLoading } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => api.getGoal(id),
    enabled: !!id,
  });

  return {
    goal,
    isLoading,
  };
}
