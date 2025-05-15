import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, CreateLinkInput, UpdateLinkInput } from '@/lib/types/board';

export function useLinks() {
  const queryClient = useQueryClient();

  const { data: links = [], isLoading: isLoadingLinks } = useQuery<Link[]>({
    queryKey: ['links'],
    queryFn: async () => {
      const response = await axios.get('/api/links');
      return response.data;
    },
  });

  const createMutation = useMutation<Link, Error, CreateLinkInput>({
    mutationFn: async (data) => {
      const response = await axios.post('/api/links', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('링크가 등록되었습니다.');
    },
    onError: (error) => {
      toast.error(`링크 등록 실패: ${error.message}`);
    },
  });

  const updateMutation = useMutation<Link, Error, UpdateLinkInput>({
    mutationFn: async (data) => {
      const response = await axios.put(`/api/links/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('링크가 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(`링크 수정 실패: ${error.message}`);
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await axios.delete(`/api/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('링크가 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(`링크 삭제 실패: ${error.message}`);
    },
  });

  const createLink = async (data: CreateLinkInput) => {
    await createMutation.mutateAsync(data);
  };

  const updateLink = async (data: UpdateLinkInput) => {
    await updateMutation.mutateAsync(data);
  };

  const deleteLink = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    links,
    isLoadingLinks,
    createLink,
    updateLink,
    deleteLink,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
