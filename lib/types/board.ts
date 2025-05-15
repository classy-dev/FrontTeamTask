export interface Board {
  id: number;
  user_id: number;
  title: string;
  content: string;
  board_type: 'info' | 'idea' | 'reflection' | 'wedding' | 'dailyMission';
  reflection_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: number;
  user_id: number;
  site_name: string;
  url: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatHistory {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: Date;
}

export interface CreateBoardInput {
  title: string;
  content: string;
  board_type: 'info' | 'idea' | 'reflection' | 'wedding' | 'dailyMission';
  reflection_date?: string;
}

export interface UpdateBoardInput extends Partial<CreateBoardInput> {
  id: number;
}

export interface CreateLinkInput {
  site_name: string;
  url: string;
}

export interface UpdateLinkInput {
  id: number;
  site_name: string;
  url: string;
}

export interface CreateChatHistoryInput {
  title: string;
  content: string;
}
