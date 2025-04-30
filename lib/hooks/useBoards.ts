import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Board, CreateBoardInput, UpdateBoardInput } from '@/lib/types/board';

export function useBoards(boardType: string = 'info') {
  const queryClient = useQueryClient();

  const { data: boards = [], isLoading: isLoadingBoards } = useQuery<Board[]>({
    queryKey: ['boards', boardType],
    queryFn: async () => {
      const response = await axios.get('/api/boards', {
        params: { type: boardType }
      });
      return response.data;
    },
  });

  const createMutation = useMutation<Board, Error, CreateBoardInput>({
    mutationFn: async (data) => {
      const response = await axios.post('/api/boards', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardType] });
      toast.success('게시글이 등록되었습니다.');
    },
    onError: (error) => {
      toast.error(`게시글 등록 실패: ${error.message}`);
    },
  });

  const updateMutation = useMutation<Board, Error, UpdateBoardInput>({
    mutationFn: async (data) => {
      const response = await axios.put(`/api/boards/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardType] });
      toast.success('게시글이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(`게시글 수정 실패: ${error.message}`);
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await axios.delete(`/api/boards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardType] });
      toast.success('게시글이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(`게시글 삭제 실패: ${error.message}`);
    },
  });

  const createBoard = async (data: CreateBoardInput) => {
    await createMutation.mutateAsync(data);
  };

  const updateBoard = async (data: UpdateBoardInput) => {
    await updateMutation.mutateAsync(data);
  };

  const deleteBoard = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    boards,
    isLoadingBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
