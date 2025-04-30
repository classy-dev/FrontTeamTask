import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { Board } from '@/lib/types/board';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

interface BoardListProps {
  boards: Board[];
}

export function BoardList({ boards }: BoardListProps) {
  const router = useRouter();

  if (!boards.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          게시글이 없습니다. 새로운 글을 작성해보세요!
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="60%">제목</TableCell>
            <TableCell width="20%" align="center">작성일</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {boards.map((board) => (
            <TableRow
              key={board.id}
              hover
              onClick={() => router.push(`/boards/${board.id}?type=${board.board_type}`)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{board.title}</TableCell>
              <TableCell align="center">
                {format(new Date(board.created_at), 'yyyy-MM-dd')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
