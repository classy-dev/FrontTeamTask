import React from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateLinkInput, UpdateLinkInput, Link } from '@/lib/types/board';
import axios from 'axios';

const linkSchema = z.object({
  site_name: z.string().min(1, '사이트 이름을 입력해주세요'),
  url: z.string().url('올바른 URL을 입력해주세요'),
});

interface LinkFormProps {
  initialData?: Link;
  onSubmit: (data: CreateLinkInput | UpdateLinkInput) => void;
  onCancel: () => void;
}

export function LinkForm({ initialData, onSubmit, onCancel }: LinkFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateLinkInput>({
    resolver: zodResolver(linkSchema),
    defaultValues: initialData || {
      site_name: '',
      url: '',
    },
  });

  const fetchMetadata = async (url: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/links/metadata', { url });
      if (response.data.title) {
        setValue('site_name', response.data.title);
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Controller
          name="url"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="URL"
              error={!!errors.url}
              helperText={errors.url?.message}
              fullWidth
              onChange={(e) => {
                field.onChange(e);
                if (e.target.value) {
                  fetchMetadata(e.target.value);
                }
              }}
            />
          )}
        />

        <Controller
          name="site_name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="사이트 이름"
              error={!!errors.site_name}
              helperText={errors.site_name?.message}
              fullWidth
              InputProps={{
                endAdornment: isLoading && <CircularProgress size={20} />,
              }}
            />
          )}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>취소</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isLoading}
          >
            {initialData ? '수정' : '등록'}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}
