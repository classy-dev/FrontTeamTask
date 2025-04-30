import { Goal, Category } from '../types/goal';
import { format } from 'date-fns';

export interface UserProfile {
  content?: string;
  consultant_style?: string;
}

const getCategoryName = (categoryId: number | undefined, categories: Category[]): string => {
  if (!categoryId) return '미분류';
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : '미분류';
};

export const generateSystemMessage = (
  todaysGoals: Goal[],
  incompleteGoals: Goal[],
  categories: Category[]
): string => {
  // 오늘의 할일 문자열 생성
  let todaysGoalsStr = '없음';
  if (todaysGoals.length > 0) {
    const goalsDetails = todaysGoals.map(goal => {
      const startTime = goal.start_date ? format(new Date(goal.start_date), 'HH:mm') : '미정';
      const endTime = goal.end_date ? format(new Date(goal.end_date), 'HH:mm') : '미정';
      const category = getCategoryName(goal.category_id, categories);
      const importance = goal.importance || '미설정';

      return `- ${goal.title}\n` +
        `  ${startTime}-${endTime}\n` +
        `  카테고리: ${category}\n` +
        `  중요도: ${importance}`;
    });
    todaysGoalsStr = goalsDetails.join('\n\n');
  }

  // 미완료된 목표 문자열 생성
  let incompleteGoalsStr = '없음';
  if (incompleteGoals.length > 0) {
    const goalsDetails = incompleteGoals.map(goal => {
      const endTime = goal.end_date ? format(new Date(goal.end_date), 'MM/dd HH:mm') : '미정';
      const category = getCategoryName(goal.category_id, categories);
      const importance = goal.importance || '미설정';

      return `- ${goal.title}\n` +
        `  마감: ${endTime}\n` +
        `  카테고리: ${category}\n` +
        `  중요도: ${importance}`;
    });
    incompleteGoalsStr = goalsDetails.join('\n\n');
  }

  // 시스템 메시지 생성
  const message = `당신은 사용자의 AI 컨설턴트입니다. 
당신은 세계 최고의 동기부여가이자 목표 달성 전문가입니다.

오늘의 할일:
${todaysGoalsStr}

미완료된 목표:
${incompleteGoalsStr}`;

  return message;
};
