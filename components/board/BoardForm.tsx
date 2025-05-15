import React from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateBoardInput, UpdateBoardInput, Board } from "@/lib/types/board";
import DatePicker from "react-datepicker";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const boardSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  board_type: z.enum(
    ["info", "idea", "reflection", "wedding", "dailyMission"],
    {
      required_error: "게시글 유형을 선택해주세요",
    }
  ),
  reflection_date: z.date().nullable(),
});

type BoardFormData = z.infer<typeof boardSchema>;

interface BoardFormProps {
  initialData?: Partial<Board>;
  onSubmit: (data: CreateBoardInput) => void;
  onCancel: () => void;
}

export function BoardForm({ initialData, onSubmit, onCancel }: BoardFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      board_type: initialData?.board_type || "info",
      reflection_date: initialData?.reflection_date
        ? new Date(initialData.reflection_date)
        : null,
    },
  });

  console.log("initialData", initialData);

  const boardType = watch("board_type");

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const handleFormSubmit = (data: BoardFormData) => {
    onSubmit({
      ...data,
      reflection_date: data.reflection_date?.toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
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
          name="content"
          control={control}
          render={({ field }) => (
            <Box>
              <ReactQuill
                value={field.value}
                onChange={field.onChange}
                modules={modules}
                theme="snow"
                placeholder="내용을 입력하세요..."
                style={{ height: "300px", marginBottom: "40px" }}
              />
              {errors.content && (
                <FormHelperText error>{errors.content.message}</FormHelperText>
              )}
            </Box>
          )}
        />

        <Controller
          name="board_type"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.board_type} fullWidth>
              <InputLabel>게시글 유형</InputLabel>
              <Select {...field} label="게시글 유형">
                <MenuItem value="info">정보</MenuItem>
                <MenuItem value="idea">아이디어</MenuItem>
                <MenuItem value="dailyMission">데일리 미션</MenuItem>
                <MenuItem value="reflection">회고</MenuItem>
              </Select>
              {errors.board_type && (
                <FormHelperText>{errors.board_type.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {boardType === "reflection" && (
          <Controller
            name="reflection_date"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Box className="date-picker-wrapper">
                <DatePicker
                  selected={value}
                  onChange={onChange}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="회고일을 선택하세요"
                  className="date-picker"
                />
              </Box>
            )}
          />
        )}

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}

// DatePicker 스타일
const styles = `
  .date-picker-wrapper {
    width: 100%;
  }
  .date-picker {
    width: 100%;
    padding: 16.5px 14px;
    font-size: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.23);
    border-radius: 4px;
  }
  .date-picker:focus {
    border-color: #1976d2;
    outline: none;
  }
  .date-picker:hover {
    border-color: rgba(0, 0, 0, 0.87);
  }
  .date-picker.error {
    border-color: #d32f2f;
  }
  .ql-editor {
    min-height: 250px;
    max-height: 250px;
    overflow-y: auto;
  }
`;

export default function StyleRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>
        {styles}
      </style>
      {children}
    </>
  );
}
