import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { ModelType } from "@/lib/types/ai";
import { useChat } from "@/lib/hooks/useChat";
import { toast } from "react-toastify";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelType>(
    "gemini-2.5-flash-preview-04-17"
  );
  const [enableSearch, setEnableSearch] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, setSystemMessage, clearChat } =
    useChat({
      defaultModel: model,
      enableSearch: enableSearch,
      onError: (error) => toast.error(`채팅 오류: ${error.message}`),
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  useEffect(() => {
    setSystemMessage(
      "당신은 목표 달성을 돕는 AI 어시스턴트입니다. 사용자의 목표 설정과 달성을 위해 구체적이고 실용적인 조언을 제공해주세요."
    );
  }, [setSystemMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput("");
    setStreamingText("");

    await sendMessage(currentInput, {
      model: model,
      stream: true,
      enableSearch: enableSearch,
      onToken: (token) => {
        setStreamingText((prev) => prev + token);
      },
    });
  };

  return (
    <Box sx={{ height: "600px", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>모델</InputLabel>
          <Select
            value={model}
            label="모델"
            onChange={(e) => setModel(e.target.value as ModelType)}
          >
            <MenuItem value="gpt-4o">GPT-4 Optimized</MenuItem>
            <MenuItem value="gpt-4o-mini">GPT-4 Mini</MenuItem>
            <MenuItem value="claude-3-5-sonnet-20240620">
              Claude 3.5 Sonnet
            </MenuItem>
            <MenuItem value="claude-3-haiku-20240307">Claude 3 Haiku</MenuItem>
            <MenuItem value="gemini-2.5-flash-preview-04-17">
              Gemini 2.5 Flash 04-17
            </MenuItem>
            <MenuItem value="gemini-exp-1206">Gemini (12/06)</MenuItem>
          </Select>
        </FormControl>
        {model.startsWith("gemini-") && (
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
        <Tooltip title="대화 내용 삭제">
          <IconButton onClick={clearChat} color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          mb: 2,
          p: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "70%",
              backgroundColor:
                message.role === "user" ? "primary.main" : "grey.100",
              color: message.role === "user" ? "white" : "text.primary",
              p: 2,
              borderRadius: 2,
            }}
          >
            <Typography whiteSpace="pre-line">{message.content}</Typography>
          </Box>
        ))}
        {streamingText && (
          <Box
            sx={{
              alignSelf: "flex-start",
              maxWidth: "70%",
              backgroundColor: "grey.100",
              p: 2,
              borderRadius: 2,
            }}
          >
            <Typography whiteSpace="pre-line">
              {streamingText}
              <span className="cursor">▌</span>
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
          variant="outlined"
          size="small"
          multiline
          maxRows={4}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !input.trim()}
          endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          전송
        </Button>
      </form>
    </Box>
  );
}
