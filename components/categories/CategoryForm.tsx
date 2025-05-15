import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Button,
  TextField,
  Box,
  FormControl,
  FormHelperText
} from '@mui/material';
import { CreateCategoryInput, UpdateCategoryInput } from '@/lib/types/goal';

const categoryFormSchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력해주세요.'),
});

interface CategoryFormProps {
  initialData?: UpdateCategoryInput;
  onSubmit: (data: CreateCategoryInput) => void;
  isSubmitting: boolean;
}

export function CategoryForm({
  initialData,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  });

  const handleFormSubmit = (data: z.infer<typeof categoryFormSchema>) => {
    onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl error={!!errors.name}>
        <TextField
          {...register('name')}
          label="카테고리 이름"
          placeholder="카테고리 이름을 입력하세요"
          error={!!errors.name}
          fullWidth
        />
        {errors.name && (
          <FormHelperText>{errors.name.message}</FormHelperText>
        )}
      </FormControl>
      
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
      >
        {isSubmitting ? '저장 중...' : initialData ? '수정하기' : '추가하기'}
      </Button>
    </Box>
  );
}
