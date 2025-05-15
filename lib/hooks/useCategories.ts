import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/goal';
import * as api from '../api/categories';
import { toast } from 'react-toastify';

export function useCategories() {
  const queryClient = useQueryClient();

  // 카테고리 목록 조회
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  // 카테고리 생성
  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateCategoryInput) => api.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      toast.success('카테고리가 생성되었습니다.');
    },
    onError: (error) => {
    
      toast.error('카테고리 생성 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'));
    },
  });

  // 카테고리 수정
  const { mutate: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateCategoryInput) => api.updateCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    
      toast.success('카테고리가 수정되었습니다.');
    },
    onError: (error) => {
      toast.error('카테고리 수정 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'));
    },
  });

  // 카테고리 삭제
  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    
      toast.success('카테고리가 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error('카테고리 삭제 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'));
    },
  });

  return {
    categories,
    isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
