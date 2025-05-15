import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage, ModelType } from "@/lib/types/ai";
import { ChatMemoryManager } from "@/lib/services/ai/memory-langchain";
import { LangChainService } from "@/lib/services/ai/langchain";
import { GeminiService } from "@/lib/services/ai/gemini";
import { useBoards } from "./useBoards";
import { useGoals } from "./useGoals";
import { useCategories } from "./useCategories";
import axios from "axios";

interface UseChatOptions {
  maxTokens?: number;
  defaultModel?: ModelType;
  enableSearch?: boolean; // 웹 검색 활성화 옵션 추가
  onError?: (error: Error) => void;
}

interface CommandResult {
  type: "search" | "board" | "goal" | "none";
  content: string;
}

export function useChat({
  maxTokens = 4000,
  defaultModel = "claude-3-haiku-20240307",
  enableSearch = false,
  onError,
}: UseChatOptions = {}) {
  const [endGeminiStreming, SetEndGeminiStreming] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchResult, setLastSearchResult] = useState<string | null>(null);
  const memory = useRef(new ChatMemoryManager(maxTokens)).current;
  const service = useRef(LangChainService.getInstance()).current;
  const geminiService = useRef(GeminiService.getInstance()).current;

  const { createBoard } = useBoards();
  const { createGoal } = useGoals();
  const { categories } = useCategories();

  // 명령어 처리 함수
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const processCommand = async (content: string): Promise<CommandResult> => {
    // 검색 명령어 처리
    if (content.endsWith("검색해줘")) {
      const query = content.slice(0, -4).trim();
      try {
        const response = await axios.post("/api/ai/search", { query });
        setLastSearchResult(response.data.results);
        return {
          type: "search",
          content: response.data.results,
        };
      } catch (error) {
        console.error("Search error:", error);
        throw error;
      }
    }

    // 게시판 저장 명령어 처리
    if (content.includes("게시판에 올려줘")) {
      let title = "";
      let boardContent = content;
      let boardType = "info";

      // 제목 추출
      if (content.includes("제목은") && content.includes("로")) {
        const titleMatch = content.match(/제목은\s+(.+?)\s+로/);
        if (titleMatch) {
          title = titleMatch[1];
          boardContent = content.replace(/제목은\s+.+?\s+로/, "").trim();
        }
      }

      // 게시판 종류 결정
      if (content.includes("아이디어 게시판")) {
        boardType = "idea";
        boardContent = boardContent
          .replace("아이디어 게시판에 올려줘", "")
          .trim();
      } else if (content.includes("정보 게시판")) {
        boardType = "info";
        boardContent = boardContent.replace("정보 게시판에 올려줘", "").trim();
      }

      // 방금 검색 결과 저장
      if (content.includes("방금 검색 결과")) {
        if (lastSearchResult) {
          boardContent = lastSearchResult;
        } else {
          throw new Error("최근 검색 결과가 없습니다.");
        }
      }

      await createBoard({
        title: title || "새 게시글",
        content: boardContent,
        board_type: boardType as "info" | "idea" | "reflection",
      });

      return {
        type: "board",
        content: `게시글이 ${
          boardType === "idea" ? "아이디어" : "정보"
        } 게시판에 저장되었습니다.`,
      };
    }

    // 목표 추가 명령어 처리
    if (content.includes("추가해줘")) {
      let title = content.replace("추가해줘", "").trim();
      let categoryId: number | null = null;

      // 카테고리 추출
      const categoryMatch = content.match(/(.+?)에\s+(.+?)\s+추가해줘/);
      if (categoryMatch) {
        const categoryName = categoryMatch[1].trim();
        const category = categories.find((c) => c.name === categoryName);
        if (category) {
          categoryId = category.id;
          title = categoryMatch[2].trim();
        }
      }

      const startDate = new Date();
      const endDate = new Date();
      startDate.setHours(9, 0, 0); // 기본값 오전 9시
      endDate.setHours(10, 0, 0); // 기본값 오전 10시

      // 날짜 처리
      const specificDateMatch = content.match(/(\d{1,2})월\s*(\d{1,2})일/);
      if (specificDateMatch) {
        const month = parseInt(specificDateMatch[1]) - 1; // 0-based month
        const day = parseInt(specificDateMatch[2]);
        const year =
          startDate.getFullYear() + (month < startDate.getMonth() ? 1 : 0);

        startDate.setFullYear(year, month, day);
        endDate.setFullYear(year, month, day);
        title = title
          .replace(`${specificDateMatch[1]}월 ${specificDateMatch[2]}일`, "")
          .trim();
      } else if (content.includes("모레")) {
        startDate.setDate(startDate.getDate() + 2);
        endDate.setDate(endDate.getDate() + 2);
        title = title.replace("모레", "").trim();
      } else if (content.includes("내일 모레")) {
        startDate.setDate(startDate.getDate() + 2);
        endDate.setDate(endDate.getDate() + 2);
        title = title.replace("내일 모레", "").trim();
      } else if (content.includes("내일")) {
        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);
        title = title.replace("내일", "").trim();
      } else if (content.includes("다음주")) {
        startDate.setDate(startDate.getDate() + 7);
        endDate.setDate(endDate.getDate() + 7);
        title = title.replace("다음주", "").trim();
      }

      // 시간 처리
      const specificTimeMatch = content.match(/(\d{1,2})시\s*(\d{1,2})?분?/);
      if (specificTimeMatch) {
        const hours = parseInt(specificTimeMatch[1]);
        const minutes = specificTimeMatch[2]
          ? parseInt(specificTimeMatch[2])
          : 0;

        // 오후/저녁 시간대 처리 (1~11시는 오후로 간주)
        const adjustedHours =
          hours <= 11 && content.match(/저녁|오후/) ? hours + 12 : hours;

        startDate.setHours(adjustedHours, minutes, 0);
        endDate.setHours(adjustedHours + 1, minutes, 0); // 기본 1시간 duration

        // 시간 관련 텍스트 제거
        title = title
          .replace(/(\d{1,2})시\s*(\d{1,2})?분?/, "")
          .trim()
          .replace(/(오전|오후|저녁)/, "")
          .trim();
      } else if (content.includes("아침")) {
        startDate.setHours(9, 0, 0);
        endDate.setHours(10, 0, 0);
        title = title.replace("아침", "").trim();
      } else if (content.includes("저녁")) {
        startDate.setHours(19, 0, 0);
        endDate.setHours(20, 0, 0);
        title = title.replace("저녁", "").trim();
      }

      // 정각 표현 처리 ("12시 정각에")
      if (content.includes("정각")) {
        endDate.setMinutes(0);
        title = title.replace("정각", "").trim();
      }

      await createGoal({
        title,
        category_id: categoryId ? Number(categoryId) : undefined,
        start_date: startDate,
        end_date: endDate,
        status: "진행 전",
        importance: 5,
      });

      return {
        type: "goal",
        content: "목표가 추가되었습니다.",
      };
    }

    return {
      type: "none",
      content: "",
    };
  };

  const handleGeminiChat = async (
    content: string,
    options?: {
      stream?: boolean;
      onToken?: (token: string) => void;
      model?: string;
      enableSearch?: boolean;
    }
  ) => {
    try {
      // 시스템 메시지 가져오기
      const response = await axios.post("/api/ai/chat", {
        messages: [],
        model: options?.model || "gemini-2.5-flash-preview-04-17",
      });
      const systemMessage = response.data.systemMessage;

      console.log("Gemini system message:", systemMessage);

      try {
        geminiService.setModel(
          options?.model || "gemini-2.5-flash-preview-04-17",
          systemMessage,
          options?.enableSearch || enableSearch
        );
      } catch (error) {
        console.error("Failed to initialize Gemini service:", error);
        throw new Error(
          "Gemini API is not properly configured. Falling back to default model."
        );
      }

      // 현재 메시지 컨텍스트 구성 (새로운 사용자 메시지 포함)
      const currentMessages = [...messages, { role: "user", content }];

      if (options?.stream) {
        const stream = await geminiService.chatStream(currentMessages);
        const assistantMessage = { role: "assistant", content: "" };
        setMessages((prev) => [...prev, assistantMessage]);

        for await (const chunk of stream) {
          const text = chunk.text();
          assistantMessage.content += text;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...assistantMessage };
            return newMessages;
          });
          options?.onToken?.(text);
        }
        SetEndGeminiStreming(true);
      } else {
        const response = await geminiService.chat(currentMessages);
        const assistantMessage = { role: "assistant", content: response };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      onError?.(error as Error);
      throw error;
    }
  };

  const sendMessage = useCallback(
    async (
      content: string,
      options?: {
        model?: ModelType;
        stream?: boolean;
        onToken?: (token: string) => void;
        enableSearch?: boolean;
      }
    ) => {
      if (!content.trim() || isLoading) return;

      try {
        setIsLoading(true);

        // 명령어 처리
        const commandResult = await processCommand(content.trim());

        // Handle Gemini chat separately
        const currentModel = options?.model || defaultModel;
        if (currentModel.startsWith("gemini-")) {
          // 사용자 메시지 추가
          const userMessage = { role: "user", content: content.trim() };
          setMessages((prev) => [...prev, userMessage]);

          const result = await handleGeminiChat(content, {
            ...options,
            enableSearch: options?.enableSearch || enableSearch,
          });
          setIsLoading(false);
          return result;
        }

        // 사용자 메시지 추가
        const userMessage: ChatMessage = {
          role: "user",
          content: content.trim(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // 명령어 결과가 있는 경우 바로 응답
        if (commandResult.type !== "none") {
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: commandResult.content,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return commandResult.content;
        }

        // Handle other models
        const response = await axios.post("/api/ai/chat", {
          messages: [...messages, userMessage],
          model: currentModel,
        });

        if (!response.data || typeof response.data.content !== "string") {
          console.error("Invalid response:", response.data);
          throw new Error("AI 응답이 올바른 형식이 아닙니다.");
        }

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.data.content,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        return response.data.content;
      } catch (error) {
        console.error("Error in sendMessage:", error);
        setIsLoading(false);
        onError?.(error as Error);
        throw error;
      }
    },
    [
      messages,
      isLoading,
      defaultModel,
      onError,
      enableSearch,
      handleGeminiChat,
      processCommand,
    ]
  );

  const setSystemMessage = useCallback(
    (content: string) => {
      const systemMessage: ChatMessage = { role: "system", content };
      memory.addMessage(systemMessage);
    },
    [memory]
  );

  const clearChat = useCallback(async () => {
    await memory.clear();
    const updatedMessages = await memory.getMessages();
    setMessages(updatedMessages);
  }, [memory]);

  const resetMessages = useCallback(
    (newMessages: any[] = []) => {
      setMessages(newMessages);
      memory.clear();
      if (newMessages.length > 0) {
        memory.addMessages(newMessages);
      }
    },
    [memory]
  );

  // 초기 메시지 로드
  useEffect(() => {
    const loadMessages = async () => {
      const initialMessages = await memory.getMessages();
      setMessages(initialMessages);
    };
    loadMessages();
  }, [memory]);

  return {
    messages,
    isLoading,
    endGeminiStreming,
    sendMessage,
    resetMessages,
    setSystemMessage,
    clearChat,
  };
}
