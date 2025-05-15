import React from "react";
import { Layout } from "@/components/layout";
import { BoardList } from "@/components/board/BoardList";
import { useBoards } from "@/lib/hooks/useBoards";
import { useRouter } from "next/router";
import { css } from "@emotion/react";
import { Box, Typography, Button, Pagination } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Board } from "@/lib/types/board";

const ITEMS_PER_PAGE = 10;

const boardTypes = {
  info: {
    title: "정보 게시판",
    description: "유용한 정보를 공유하는 공간입니다.",
  },
  idea: {
    title: "아이디어 게시판",
    description: "새로운 아이디어를 제안하고 토론하는 공간입니다.",
  },
  reflection: {
    title: "회고 게시판",
    description: "경험을 돌아보고 공유하는 공간입니다.",
  },
  dailyMission: {
    title: "데일리 미션 게시판",
    description: "일상적인 목표와 도전을 공유하고 응원하는 공간입니다.",
  },
};

export default function BoardsPage() {
  const router = useRouter();
  const { type = "info" } = router.query;
  const boardType = type as keyof typeof boardTypes;

  const { boards, isLoadingBoards } = useBoards(boardType);

  const [page, setPage] = React.useState(1);

  // 현재 게시판 타입에 맞는 게시글만 필터링
  const filteredBoards = boards.filter(
    (board) => board.board_type === boardType
  );

  // 페이지네이션 처리
  const totalPages = Math.ceil(filteredBoards.length / ITEMS_PER_PAGE);
  const paginatedBoards = filteredBoards.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleNewPost = () => {
    router.push(`/boards/new?mode=edit&type=${boardType}`);
  };

  if (isLoadingBoards) {
    return (
      <div
        css={css`
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        Loading...
      </div>
    );
  }

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h4">{boardTypes[boardType].title}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {boardTypes[boardType].description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{ height: "2.5rem" }}
          startIcon={<AddIcon />}
          onClick={handleNewPost}
        >
          새 글 작성
        </Button>
      </Box>

      <BoardList boards={paginatedBoards} />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Layout>
  );
}
