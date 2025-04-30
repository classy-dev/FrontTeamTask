import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack
} from '@mui/material';
import { CreateGoalInput, UpdateGoalInput } from '@/lib/types/goal';
import { format } from 'date-fns';

const goalFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  start_date: z.date(),
  end_date: z.date(),
  trigger_action: z.string().optional(),
  importance: z.number().min(1).max(5).default(3),
  memo: z.string().optional(),
  status: z.enum(['진행 전', '진행 중', '완료', '취소']).default('진행 전'),
  category_id: z.number().optional(),
});

interface GoalFormProps {
  initialData?: UpdateGoalInput | null;
  onSubmit: (data: CreateGoalInput | UpdateGoalInput) => void;
  isSubmitting?: boolean;
  categories?: { id: number; name: string }[];
}

const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  .react-datepicker__input-container input:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

export function GoalForm({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  categories = [],
}: GoalFormProps) {
  const now = new Date();
  const defaultEndDate = new Date(now.getTime() + 60 * 60 * 1000); // 1시간 후

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      start_date: initialData?.start_date ? new Date(initialData.start_date) : now,
      end_date: initialData?.end_date ? new Date(initialData.end_date) : defaultEndDate,
      trigger_action: initialData?.trigger_action || '',
      importance: initialData?.importance || 3,
      memo: initialData?.memo || '',
      status: initialData?.status || '진행 전',
      category_id: initialData?.category_id,
    },
  });

  const onSubmitForm = (data: z.infer<typeof goalFormSchema>) => {
    const formattedData = {
      ...data,
      start_date: data.start_date.toISOString(),
      end_date: data.end_date.toISOString(),
    };

    // 수정인 경우 id 포함
    if (initialData?.id) {
      onSubmit({ ...formattedData, id: initialData.id } as any);
    } else {
      onSubmit(formattedData  as any);
    }
  };

  return (
    <>
      <style jsx global>{datePickerStyles}</style>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack spacing={3}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="제목"
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="start_date"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                selected={value}
                onChange={(date: Date | null, event?: React.MouseEvent | React.KeyboardEvent) => onChange(date)}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="시작일시 선택"
                className="form-control"
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="시간"
              />
            )}
          />

          <Controller
            name="end_date"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                selected={value}
                onChange={(date: Date | null, event?: React.MouseEvent | React.KeyboardEvent) => onChange(date)}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="종료일시 선택"
                className="form-control"
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="시간"
              />
            )}
          />

          <Controller
            name="trigger_action"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="실천 방법"
                error={!!errors.trigger_action}
                helperText={errors.trigger_action?.message}
                fullWidth
              />
            )}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Controller
              name="importance"
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.importance}>
                  <InputLabel>중요도</InputLabel>
                  <Select {...field} label="중요도">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.importance && (
                    <FormHelperText>{errors.importance.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.category_id}>
                  <InputLabel>카테고리</InputLabel>
                  <Select {...field} label="카테고리">
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category_id && (
                    <FormHelperText>{errors.category_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.status}>
                <InputLabel>상태</InputLabel>
                <Select {...field} label="상태">
                  {['진행 전', '진행 중', '완료', '취소'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="memo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="메모"
                multiline
                rows={4}
                error={!!errors.memo}
                helperText={errors.memo?.message}
                fullWidth
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {initialData ? '수정' : '생성'}
          </Button>
        </Stack>
      </form>
    </>
  );
}
