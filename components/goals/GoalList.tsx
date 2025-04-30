import React from 'react';
import { useRouter } from 'next/router';
import { Goal } from '@/lib/types/goal';
import { 
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Skeleton,
  Stack,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GoalListProps {
  goals: Goal[];
  isLoading: boolean;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function GoalList({
  goals,
  isLoading,
  onComplete,
  onDelete,
}: GoalListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="40%" />
            </CardContent>
            <CardActions>
              <Skeleton variant="rectangular" width={64} height={36} />
            </CardActions>
          </Card>
        ))}
      </Stack>
    );
  }

  if (goals.length === 0) {
    return (
      <Typography 
        variant="body1" 
        color="text.secondary" 
        align="center" 
        sx={{ py: 4 }}
      >
        등록된 목표가 없습니다.
      </Typography>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'success';
      case '진행 중':
        return 'primary';
      case '진행 전':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPP', { locale: ko });
  };

  return (
    <Stack spacing={2}>
      {goals.map((goal) => (
        <Card key={goal.id}>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
              <Typography variant="h6" component="h2">
                {goal.title}
              </Typography>
              <Chip 
                label={goal.status} 
                color={getStatusColor(goal.status) as any}
                size="small"
              />
            </div>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              시작일: {goal.start_date ? formatDate(String(goal.start_date)) : '미정'}
            </Typography>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              종료일: {goal.end_date ? formatDate(String(goal.end_date)) : '미정'}
            </Typography>
            {goal.trigger_action && (
              <Typography color="text.secondary" variant="body2" gutterBottom>
                실천 방법: {goal.trigger_action}
              </Typography>
            )}
            {goal.memo && (
              <Typography color="text.secondary" variant="body2">
                메모: {goal.memo}
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              onClick={() => router.push(`/goals/${goal.id}`)}
              size="small"
            >
              상세보기
            </Button>
            {goal.status !== '완료' && onComplete && (
              <IconButton
                color="success"
                onClick={() => onComplete(goal.id)}
                size="small"
              >
                <CheckIcon />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                color="error"
                onClick={() => onDelete(goal.id)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </CardActions>
        </Card>
      ))}
    </Stack>
  );
}
