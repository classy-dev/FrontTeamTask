import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Skeleton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Lightbulb as IdeaIcon,
  History as ReflectionIcon,
  Favorite as WeddingIcon,
  Assignment as MissionIcon,
} from "@mui/icons-material";
import { Layout } from "@/components/layout";
import { BoardForm } from "@/components/board/BoardForm";
import { useBoards } from "@/lib/hooks/useBoards";
import { Board } from "@/lib/types/board";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function BoardPage() {
  const router = useRouter();
  const { id, type = "info", mode = "view" } = router.query;
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const { updateBoard, deleteBoard, createBoard } = useBoards();

  const isNew = id === "new";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const { data: board, isLoading } = useQuery<Board>({
    queryKey: ["board", id],
    queryFn: async () => {
      const response = await axios.get(`/api/boards/${id}`);
      return response.data;
    },
    enabled: !!id && !isNew,
  });

  const handleSubmit = async (data: any) => {
    try {
      if (isNew) {
        await createBoard({ ...data, board_type: type });
        router.push(`/boards?type=${type}`);
      } else if (isEdit && board) {
        await updateBoard({ ...data, id: board.id });
        router.push(`/boards?type=${data.board_type}`);
      }
    } catch (error) {
      console.error("Failed to save board:", error);
    }
  };

  const handleEdit = () => {
    router.push(`/boards/${id}?mode=edit`);
  };

  const handleDelete = async () => {
    if (board) {
      await deleteBoard(board.id);
      setDeleteDialogOpen(false);
      router.push(`/boards?type=${type}`);
    }
  };

  const getBoardTypeIcon = (type: Board["board_type"]) => {
    switch (type) {
      case "info":
        return <InfoIcon color="info" />;
      case "idea":
        return <IdeaIcon color="warning" />;
      case "reflection":
        return <ReflectionIcon color="success" />;
      case "wedding":
        return <WeddingIcon color="error" />;
      case "dailyMission":
        return <MissionIcon color="primary" />;
    }
  };

  const getBoardTypeText = (type: Board["board_type"]) => {
    switch (type) {
      case "info":
        return "정보";
      case "idea":
        return "아이디어";
      case "reflection":
        return "회고";
      case "dailyMission":
        return "데일리 미션";
    }
  };

  if (isLoading && !isNew) {
    return (
      <Layout>
        <Skeleton variant="rectangular" height={200} />
      </Layout>
    );
  }

  if (isNew || isEdit) {
    return (
      <Layout>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/boards?type=${type}`)}
          sx={{ mb: 2 }}
        >
          목록으로
        </Button>

        <Typography variant="h4" sx={{ mb: 3 }}>
          {isNew ? "새 글 작성" : "게시글 수정"}
        </Typography>

        <BoardForm
          initialData={
            isNew ? { board_type: type as Board["board_type"] } : board
          }
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          height: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/boards?type=${type}`)}
          sx={{ mb: 2 }}
        >
          목록으로
        </Button>

        {isView && board && (
          <>
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={() => router.back()}>
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {board.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    icon={getBoardTypeIcon(board.board_type)}
                    label={getBoardTypeText(board.board_type)}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(board.created_at), "yyyy년 MM월 dd일", {
                      locale: ko,
                    })}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <IconButton onClick={handleEdit}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Paper sx={{ p: 3 }}>
              <Typography
                component="div"
                sx={{
                  "& p": { my: 1 },
                  "& a": { color: "primary.main", textDecoration: "none" },
                  "& a:hover": { textDecoration: "underline" },
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: board.content }}
              />
            </Paper>
          </>
        )}

        {/* 삭제 확인 다이얼로그 */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>게시글 삭제</DialogTitle>
          <DialogContent>
            <Typography>정말 이 게시글을 삭제하시겠습니까?</Typography>
            <Typography variant="caption" color="error">
              이 작업은 되돌릴 수 없습니다.
            </Typography>
          </DialogContent>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", p: 2, gap: 1 }}
          >
            <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
            <Button onClick={handleDelete} color="error">
              삭제
            </Button>
          </Box>
        </Dialog>
      </Box>
    </Layout>
  );
}
