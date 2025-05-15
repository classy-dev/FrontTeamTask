import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { getUser, getAuthToken } from "../../lib/api/auth";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  AlertColor,
} from "@mui/material";

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<{
    text: string;
    severity: AlertColor;
  }>({
    text: "",
    severity: "info",
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    setUser(getUser());
    setIsLoadingUser(false);
  }, []);

  if (isLoadingUser) {
    return null;
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
        <Alert severity="error">로그인이 필요합니다</Alert>
      </Box>
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", severity: "info" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        text: "새 비밀번호가 일치하지 않습니다",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "비밀번호 변경 실패");
      }

      setMessage({
        text: "비밀번호가 성공적으로 변경되었습니다",
        severity: "success",
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      setMessage({
        text:
          error instanceof Error ? error.message : "비밀번호 변경 중 오류 발생",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        프로필 설정
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          비밀번호 변경
        </Typography>

        {message.text && (
          <Alert severity={message.severity} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <TextField
          fullWidth
          margin="normal"
          label="현재 비밀번호"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="새 비밀번호"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="새 비밀번호 확인"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "처리 중..." : "비밀번호 변경"}
        </Button>
      </Box>
    </Box>
  );
}
