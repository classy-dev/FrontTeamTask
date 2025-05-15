import React, { useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useChat } from "@/lib/hooks/useChat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DeleteIcon from "@mui/icons-material/Delete";

import { ModelType } from "@/lib/types/ai";
import ReactMarkdown from "react-markdown";

export default function HomePage() {
  const [selectedModel, setSelectedModel] = React.useState<ModelType>(
    "gemini-2.5-flash-preview-04-17"
  );
  const [enableSearch, setEnableSearch] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [sessionTitle, setSessionTitle] = React.useState("새로운 대화");
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] =
    React.useState(false);
  const [isSessionListOpen, setIsSessionListOpen] = React.useState(false);
  const [currentSessionId, setCurrentSessionId] = React.useState<number | null>(
    null
  );
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { messages, isLoading, endGeminiStreming, sendMessage, resetMessages } =
    useChat({
      defaultModel: selectedModel,
      enableSearch: enableSearch,
      onError: (error) => {
        console.error("Chat error:", error);
      },
    });

  const queryClient = useQueryClient();

  // 채팅 세션 목록을 React Query로 관리
  const { data: chatSessions = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await fetch("/api/chats");
      if (!response.ok) {
        throw new Error("Failed to fetch chat sessions");
      }
      return response.json();
    },
  });

  const updateSessionTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch(`/api/chats/${currentSessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        throw new Error("Failed to update session title");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  useEffect(() => {
    if (
      currentSessionId !== null &&
      messages.length === 1 &&
      sessionTitle === "새로운 대화"
    ) {
      updateSessionTitleMutation.mutate(messages[0].content);
    }
  }, [messages.length, sessionTitle, currentSessionId]);

  // 대화 내용이 변경될 때마다 저장
  useEffect(() => {
    if (currentSessionId && messages.length > 0 && endGeminiStreming) {
      const saveChat = async () => {
        try {
          await fetch("/api/chats", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: currentSessionId,
              content: JSON.stringify(messages),
            }),
          });
        } catch (error) {
          console.error("Failed to save chat:", error);
        }
      };
      saveChat();
    }
  }, [messages, currentSessionId, endGeminiStreming]);

  // 새 대화 세션 시작
  const startNewSession = async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: sessionTitle,
          content: "[]",
        }),
      });

      if (response.ok) {
        const newSession = await response.json();
        setCurrentSessionId(newSession.id);
        resetMessages();
        setIsNewSessionDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    } catch (error) {
      console.error("Failed to create new session:", error);
    }
  };

  // 대화 세션 불러오기
  const loadChatSession = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chats/${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        setCurrentSessionId(session.id);
        setSessionTitle(session.title);
        const savedMessages = JSON.parse(session.content);
        // useChat hook에 메시지 설정 기능 추가 필요
        resetMessages(savedMessages);
        setIsSessionListOpen(false);
      }
    } catch (error) {
      console.error("Failed to load chat session:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]); // messages가 변경될 때마다 스크롤

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input, {
      model: selectedModel,
      stream: true,
      enableSearch: enableSearch,
      onToken: (token) => {
        // 스트리밍 토큰 처리
      },
    });
    setInput("");
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [messages, isLoading]);

  const models = [
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4o Mini", value: "gpt-4o-mini" },
    { label: "Claude-3.5 Sonnet", value: "claude-3-5-sonnet-20240620" },
    { label: "Claude-3 Haiku", value: "claude-3-haiku-20240307" },
    {
      label: "Gemini 2.5 Flash 04-17",
      value: "gemini-2.5-flash-preview-04-17",
    },
    { label: "Gemini (12/06)", value: "gemini-exp-1206" },
  ];

  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: number) => {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete chat session");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
        }}
      >
        <FormControl style={{ width: "20rem" }} size="small">
          <InputLabel>AI 모델 선택</InputLabel>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelType)}
            label="AI 모델 선택"
          >
            {models.map((model) => (
              <MenuItem key={model.value} value={model.value}>
                {model.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedModel.startsWith("gemini-") && (
          <FormControlLabel
            control={
              <Switch
                checked={enableSearch}
                onChange={(e) => setEnableSearch(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label="웹 검색"
            sx={{ ml: 1 }}
          />
        )}
        <Box sx={{ ml: "auto" }}>
          <Button variant="outlined" onClick={startNewSession} sx={{ mr: 1 }}>
            새 대화
          </Button>
          <Button variant="outlined" onClick={() => setIsSessionListOpen(true)}>
            대화 목록
          </Button>
        </Box>
      </Box>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          height: "calc(100vh - 100px)", // 입력 영역과 모델 선택 영역을 제외한 높이
          padding: "0 2rem 2rem",
        }}
      >
        {messages
          .filter((message) => message.role !== "system")
          .map((message, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  maxWidth: { xs: "85%", sm: "70%" },
                  backgroundColor:
                    message.role === "user" ? "#f8e536" : "#ffffff",
                  color: "#070707",
                  "& p": {
                    // 마크다운 p 태그 스타일
                    m: 0,
                    mb: 1,
                    "&:last-child": {
                      mb: 0,
                    },
                  },
                  "& ul, & ol": {
                    // 리스트 스타일
                    m: 0,
                    mb: 1,
                    pl: 2.5,
                    "&:last-child": {
                      mb: 0,
                    },
                  },
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    // 헤더 스타일
                    mt: 1,
                    mb: 1,
                    "&:first-child": {
                      mt: 0,
                    },
                    "&:last-child": {
                      mb: 0,
                    },
                  },
                  "& strong": {
                    // 볼드 텍스트 스타일
                    fontWeight: 600,
                  },
                  "& em": {
                    // 이탤릭 텍스트 스타일
                    fontStyle: "italic",
                  },
                  "& code": {
                    // 코드 블록 스타일
                    p: 0.5,
                    borderRadius: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    fontFamily: "monospace",
                  },
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
        <div ref={messagesEndRef} /> {/* 스크롤 타겟 */}
      </div>
      {currentSessionId ? (
        <Box
          component="form"
          onSubmit={handleSend}
          sx={{
            display: "flex",
            width: "90%",
            height: "90px",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            margin: "0 auto",
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSend(e);
                }
              }
            }}
            placeholder="메시지를 입력하세요... "
            disabled={isLoading || !currentSessionId}
            multiline
            maxRows={4}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: 2,
              },
              "&::disabled": "background-color: red",
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !input.trim()}
            sx={{
              minWidth: { xs: "60px", sm: "80px" },
              height: "40px",
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : "전송"}
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            width: "90%",
            height: "90px",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            margin: "0 auto",
          }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={startNewSession}
            sx={{
              minWidth: "100%",
              height: "40px",
            }}
          >
            새 대화
          </Button>
        </Box>
      )}
      {/* 새 대화 세션 다이얼로그 */}
      <Dialog
        open={isNewSessionDialogOpen}
        onClose={() => setIsNewSessionDialogOpen(false)}
      >
        <DialogTitle>새 대화 시작</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="대화 제목"
            fullWidth
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewSessionDialogOpen(false)}>취소</Button>
          <Button onClick={startNewSession}>시작</Button>
        </DialogActions>
      </Dialog>

      {/* 대화 세션 목록 다이얼로그 */}
      <Dialog
        open={isSessionListOpen}
        onClose={() => setIsSessionListOpen(false)}
      >
        <DialogTitle>대화 목록</DialogTitle>
        <DialogContent>
          <List>
            {chatSessions.map((session: any) => (
              <ListItem
                key={session.id}
                component="div"
                sx={{ cursor: "pointer" }}
                onClick={() => loadChatSession(session.id)}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm("정말로 이 대화를 삭제하시겠습니까?")
                      ) {
                        deleteChatMutation.mutate(session.id);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={session.title}
                  secondary={new Date(session.created_at).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSessionListOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
