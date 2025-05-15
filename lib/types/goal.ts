export interface Goal {
  id: number;
  user_id: number;
  title: string;
  start_date?: Date;
  end_date?: Date;
  trigger_action?: string;
  importance: number;
  memo?: string;
  status: '진행 전' | '진행 중' | '완료' | '취소';
  category_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  created_at: Date;
}

export interface GoalAnalysis {
  id: number;
  user_id: number;
  period: string;
  goals_analyzed: string;
  analysis_result: string;
  created_at: Date;
}

export interface CreateGoalInput {
  title: string;
  start_date?: Date;
  end_date?: Date;
  trigger_action?: string;
  importance?: number;
  memo?: string;
  status?: '진행 전' | '진행 중' | '완료' | '취소';
  category_id?: number;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  id: number;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput extends CreateCategoryInput {
  id: number;
}

export interface GoalAnalysisInput {
  period: string;
  goals_analyzed: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  status: '진행 전' | '진행 중' | '완료' | '취소';
  start_date?: Date;
  end_date?: Date;
  category_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Board {
  id: number;
  title: string;
  content: string;
  board_type: 'info' | 'idea' | 'reflection';
  reflection_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardInput {
  title: string;
  content: string;
  board_type: 'info' | 'idea' | 'reflection';
  reflection_date?: string;
}

export interface UpdateBoardInput extends Partial<CreateBoardInput> {
  id: number;
}
