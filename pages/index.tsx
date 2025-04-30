import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useGoals, ViewType } from '@/lib/hooks/useGoals';
import { useBoards } from '@/lib/hooks/useBoards';
import { useLongTermGoals } from '@/lib/hooks/useLongTermGoals';
import { useMonthlyGoals } from '@/lib/hooks/useMonthlyGoals';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Divider,
  Typography,
  Tabs,
  Tab,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import styles from './index.module.css';
import { useWeeklyGoals } from '@/lib/hooks/useWeeklyGoals';

interface LongTermGoal {
  id: number;
  title: string;
  target_year: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

interface MonthlyGoal {
  id: number;
  title: string;
  target_year: number;
  target_month: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}
  // WeeklyGoal 인터페이스 추가
interface WeeklyGoal {
  id: number;
  title: string;
  target_year: number;
  target_month: number;
  target_week: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}


export default function GoalsPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedView, setSelectedView] = useState<ViewType>('today');
  const [selectedGoal, setSelectedGoal] = useState<LongTermGoal | MonthlyGoal | null>(null);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  const {
    goals,
    isLoadingGoals,
    updateGoal,
    deleteGoal,
    isUpdating,
    isDeleting,
  } = useGoals(selectedDate, selectedView);

  const { boards: reflections } = useBoards('reflection');

  // 진행 중인 목표와 완료된 목표 분리
  const inProgressGoals = goals.filter(goal => goal.status !== '완료');
  const completedGoals = goals.filter(goal => goal.status === '완료');

  // 오늘의 회고
  const todayReflection = reflections.find(
    r => r.reflection_date === format(selectedDate, 'yyyy-MM-dd')
  );

  // 장기 목표 상태
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [longTermGoalDialogOpen, setLongTermGoalDialogOpen] = useState(false);
  const [newLongTermGoal, setNewLongTermGoal] = useState({
    title: '',
    target_year: new Date().getFullYear(),
    memo: ''
  });
  const [editLongTermGoal, setEditLongTermGoal] = useState<LongTermGoal | null>(null);
  const { goals: longTermGoals, createGoal: createLongTermGoal, updateGoal: updateLongTermGoal, deleteGoal: deleteLongTermGoal } = useLongTermGoals(selectedYear);

  // 월간 목표 상태
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthlyGoalDialogOpen, setMonthlyGoalDialogOpen] = useState(false);
  const [newMonthlyGoal, setNewMonthlyGoal] = useState({
    title: '',
    target_year: new Date().getFullYear(),
    target_month: new Date().getMonth() + 1,
    memo: ''
  });
  const [editMonthlyGoal, setEditMonthlyGoal] = useState<MonthlyGoal | null>(null);
  const { goals: monthlyGoals, createGoal: createMonthlyGoal, updateGoal: updateMonthlyGoal, deleteGoal: deleteMonthlyGoal } = useMonthlyGoals(selectedYear, selectedMonth);

  const handleComplete = async (id: number) => {
    if (isUpdating) return;
    await updateGoal({ id, status: '완료' });
  };

  const handleDelete = async (id: number) => {
    if (isDeleting) return;
    if (window.confirm('정말로 이 목표를 삭제하시겠습니까?')) {
      await deleteGoal(id);
    }
  };

  const handleNewReflection = () => {
    router.push('/boards/new?type=reflection');
  };

  const handleEditReflection = (id: number) => {
    router.push(`/boards/${id}/edit`);
  };

  // 목표 클릭 핸들러
  const handleGoalClick = (goal: LongTermGoal | MonthlyGoal) => {
    setSelectedGoal(goal);
    setIsGoalDialogOpen(true);
  };

  const handleLongTermGoalSubmit = async () => {
    if (!newLongTermGoal.title.trim()) return;
    try {
      await createLongTermGoal(newLongTermGoal.title, newLongTermGoal.target_year, newLongTermGoal.memo);
      setNewLongTermGoal({
        title: '',
        target_year: new Date().getFullYear(),
        memo: ''
      });
      setLongTermGoalDialogOpen(false);
    } catch (error) {
      console.error('Error creating long term goal:', error);
    }
  };

  const handleMonthlyGoalSubmit = async () => {
    if (!newMonthlyGoal.title.trim()) return;
    try {
      await createMonthlyGoal(newMonthlyGoal.title, newMonthlyGoal.target_year, newMonthlyGoal.target_month, newMonthlyGoal.memo);
      setNewMonthlyGoal({
        title: '',
        target_year: new Date().getFullYear(),
        target_month: new Date().getMonth() + 1,
        memo: ''
      });
      setMonthlyGoalDialogOpen(false);
    } catch (error) {
      console.error('Error creating monthly goal:', error);
    }
  };

  const handleLongTermGoalDelete = async (id: number) => {
    if (window.confirm('정말로 이 목표를 삭제하시겠습니까?')) {
      try {
        await deleteLongTermGoal(id);
      } catch (error) {
        console.error('Error deleting long term goal:', error);
      }
    }
  };

  const handleMonthlyGoalDelete = async (id: number) => {
    if (window.confirm('정말로 이 목표를 삭제하시겠습니까?')) {
      try {
        await deleteMonthlyGoal(id);
      } catch (error) {
        console.error('Error deleting monthly goal:', error);
      }
    }
  };

  const tabs = ['오늘', '내일', '2일 후', '3일 후', '1주', '1개월'];

  // 탭 변경 시 날짜와 뷰 업데이트
  const handleTabChange = (newValue: number) => {
    setSelectedTab(newValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newView: ViewType = 'today';
    const newDate = new Date(today);
    
    switch(newValue) {
      case 0: // 오늘
        newView = 'today';
        break;
      case 1: // 내일
        newDate.setDate(today.getDate() + 1);
        newView = 'tomorrow';
        break;
      case 2: // 2일 후
        newDate.setDate(today.getDate() + 2);
        newView = 'after2days';
        break;
      case 3: // 3일 후
        newDate.setDate(today.getDate() + 3);
        newView = 'after3days';
        break;
      case 4: // 1주
        newView = 'week';
        // 현재 날짜를 기준으로 과거 7일
        newDate.setDate(today.getDate());
        break;
      case 5: // 1개월
        newView = 'month';
        // 현재 날짜를 기준으로 과거 1개월
        newDate.setMonth(today.getMonth());
        break;
    }
    
    setSelectedDate(newDate);
    setSelectedView(newView);
  };

  // 목표 메모 다이얼로그 닫기
  const handleCloseDialog = () => {
    setIsGoalDialogOpen(false);
    setSelectedGoal(null);
  };

  // 날짜별로 목표를 그룹화하는 함수
  const groupGoalsByDate = (goals: any[]) => {
    return goals.reduce((groups: { [key: string]: any[] }, goal) => {
      const date = format(new Date(goal.start_date), 'yyyy.MM.dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(goal);
      return groups;
    }, {});
  };


// 컴포넌트 내부에 상태 추가
const [weeklyGoalDialogOpen, setWeeklyGoalDialogOpen] = useState(false);
const [selectedWeek, setSelectedWeek] = useState<number>(
  Math.ceil((new Date().getDate()) / 7)
);
const [newWeeklyGoal, setNewWeeklyGoal] = useState({
  title: '',
  target_year: new Date().getFullYear(),
  target_month: selectedMonth,
  target_week: selectedWeek,
  memo: ''
});
const [editWeeklyGoal, setEditWeeklyGoal] = useState<WeeklyGoal | null>(null);

// 컴포넌트 내부에 추가
const { 
  goals: weeklyGoals, 
  createGoal: createWeeklyGoal, 
  updateGoal: updateWeeklyGoal, 
  deleteGoal: deleteWeeklyGoal 
} = useWeeklyGoals(selectedYear, selectedMonth, selectedWeek);

const handleWeeklyGoalSubmit = async () => {
  if (!newWeeklyGoal.title.trim()) return;
  await createWeeklyGoal({
    title: newWeeklyGoal.title,
    targetYear: newWeeklyGoal.target_year,
    targetMonth: selectedMonth,  // 추가
    targetWeek: newWeeklyGoal.target_week,
    memo: newWeeklyGoal.memo
  });
  setNewWeeklyGoal({
    title: '',
    target_year: new Date().getFullYear(),
    target_month: selectedMonth,  // 추가
    target_week: selectedWeek,
    memo: ''
  });
  setWeeklyGoalDialogOpen(false);
};

const handleWeeklyGoalDelete = async (id: number) => {
  if (window.confirm('정말로 이 목표를 삭제하시겠습니까?')) {
    await deleteWeeklyGoal(id);
  }
};

const handleWeeklyGoalEdit = async (goal: WeeklyGoal) => {
  setEditWeeklyGoal(goal);
  setWeeklyGoalDialogOpen(true);
};

function getWeeksInMonth(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  return Math.ceil((lastDay.getDate() + firstDay.getDay()) / 7);
}


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">목표 관리</Typography>
        
      </Box>

         {/* 장기 목표와 월간 목표 섹션 */}
         <Grid container spacing={2} sx={{ mt: 3 }}>
        {/* 장기 목표 섹션 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{selectedYear}년 목표</Typography>
              <Box>
                <FormControl sx={{ mr: 2, minWidth: 120 }}>
                  <InputLabel>연도</InputLabel>
                  <Select
                    value={selectedYear}
                    label="연도"
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <MenuItem key={year} value={year}>{year}년</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setLongTermGoalDialogOpen(true)}
                >
                  새 목표
                </Button>
              </Box>
            </Box>
            <Box>
              {longTermGoals.map((goal: LongTermGoal) => (
                <Paper key={goal.id} sx={{ p: 1, mb: 1, backgroundColor: '#f5f5f5' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>{goal.title}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => setEditLongTermGoal(goal)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleLongTermGoalDelete(goal.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleGoalClick(goal)}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
              {longTermGoals.length === 0 && (
                <Typography color="text.secondary">설정된 목표가 없습니다.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 월간 목표 섹션 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{selectedYear}년 {selectedMonth}월 목표</Typography>
              <Box>
                <FormControl sx={{ mr: 2, minWidth: 120 }}>
                  <InputLabel>월</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="월"
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <MenuItem key={month} value={month}>{month}월</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setMonthlyGoalDialogOpen(true)}
                >
                  새 목표
                </Button>
              </Box>
            </Box>
            <Box>
              {monthlyGoals.map((goal: MonthlyGoal) => (
                <Paper key={goal.id} sx={{ p: 1, mb: 1, backgroundColor: '#f5f5f5' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>{goal.title}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => setEditMonthlyGoal(goal)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleMonthlyGoalDelete(goal.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleGoalClick(goal)}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
              {monthlyGoals.length === 0 && (
                <Typography color="text.secondary">설정된 목표가 없습니다.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 주간 목표 섹션 */}
      <Grid item xs={12} md={4}>
  <Paper sx={{ p: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6">주간 목표</Typography>
      <IconButton onClick={() => setWeeklyGoalDialogOpen(true)}>
        <AddIcon />
      </IconButton>
    </Box>
    {/* 월 선택 추가 */}
    <FormControl  sx={{mr:2, mb: 2 }}>
      <InputLabel>월 선택</InputLabel>
      <Select
        value={selectedMonth}
        label="월 선택"
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <MenuItem key={month} value={month}>{month}월</MenuItem>
        ))}
      </Select>
    </FormControl>
    {/* 주차 선택 수정 */}
    <FormControl  sx={{ mb: 2 }}>
      <InputLabel>주차 선택</InputLabel>
      <Select
        value={selectedWeek}
        label="주차 선택"
        onChange={(e) => setSelectedWeek(Number(e.target.value))}
      >
        {/* 해당 월의 주차만 표시 */}
        {Array.from({ length: getWeeksInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map((week) => (
          <MenuItem key={week} value={week}>{week}주차</MenuItem>
        ))}
      </Select>
    </FormControl>
    {weeklyGoals.map((goal:any) => (
          <Paper key={goal.id} sx={{ p: 1, mb: 1, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography>{goal.title}</Typography>
          <Box>
            <IconButton size="small" onClick={() => handleWeeklyGoalEdit(goal)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleWeeklyGoalDelete(goal.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    ))}
  </Paper>
</Grid>

      <Divider sx={{ my: 4 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => handleTabChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {tabs.map((tab) => (
          <Tab key={tab} label={tab} />
        ))}
      </Tabs>
      <Button 
          variant="contained" 
          onClick={() => router.push('/goals/new')}
        >
          새 목표 추가
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* 진행 중인 목표 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              진행 중인 목표
            </Typography>
            {selectedView === 'week' || selectedView === 'month' ? (
              // 1주일 또는 1개월 탭일 경우 날짜별로 그룹화
              <>
                {Object.entries(groupGoalsByDate(inProgressGoals))
                  .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                  .map(([date, goals]) => (
                    <Box key={date} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        {date}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {goals.map((goal) => (
                        <Box
                          key={goal.id}
                          sx={{
                            mb: 2,
                            p: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                          onClick={() => router.push(`/goals/${goal.id}`)}
                        >
                          <Box>
                            <Typography>{goal.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(goal.start_date), 'HH:mm')} - {format(new Date(goal.end_date), 'HH:mm')}
                            </Typography>
                          </Box>
                          <Box onClick={(e) => e.stopPropagation()}>
                            <IconButton
                              size="small"
                              onClick={() => handleComplete(goal.id)}
                              disabled={isUpdating}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(goal.id)}
                              disabled={isDeleting}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ))}
              </>
            ) : (
              // 다른 탭의 경우 기존 표시 방식 유지
              inProgressGoals.map((goal) => (
                <Box
                  key={goal.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                  onClick={() => router.push(`/goals/${goal.id}`)}
                >
                  <Box>
                    <Typography>{goal.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {goal.start_date &&format(new Date(goal.start_date), 'HH:mm')} - {goal.end_date && format(new Date(goal.end_date), 'HH:mm')}
                    </Typography>
                  </Box>
                  <Box onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={() => handleComplete(goal.id)}
                      disabled={isUpdating}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(goal.id)}
                      disabled={isDeleting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
            {inProgressGoals.length === 0 && (
              <Typography color="text.secondary">진행 중인 목표가 없습니다.</Typography>
            )}
          </Paper>
        </Grid>

        {/* 완료된 목표 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              완료된 목표
            </Typography>
            {selectedView === 'week' || selectedView === 'month' ? (
              // 1주일 또는 1개월 탭일 경우 날짜별로 그룹화
              <>
                {Object.entries(groupGoalsByDate(completedGoals))
                  .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                  .map(([date, goals]) => (
                    <Box key={date} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        {date}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {goals.map((goal) => (
                        <Box
                          key={goal.id}
                          sx={{
                            mb: 2,
                            p: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                          onClick={() => router.push(`/goals/${goal.id}`)}
                        >
                          <Box>
                            <Typography>{goal.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(goal.start_date), 'HH:mm')} - {format(new Date(goal.end_date), 'HH:mm')}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ))}
              </>
            ) : (
              // 다른 탭의 경우 기존 표시 방식 유지
              completedGoals.map((goal) => (
                <Box
                  key={goal.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                  onClick={() => router.push(`/goals/${goal.id}`)}
                >
                  <Box>
                    <Typography>{goal.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {goal.start_date && format(new Date(goal.start_date), 'HH:mm')} - {goal.end_date && format(new Date(goal.end_date), 'HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
            {completedGoals.length === 0 && (
              <Typography color="text.secondary">완료된 목표가 없습니다.</Typography>
            )}
          </Paper>
        </Grid>

        {/* 회고 섹션 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {format(selectedDate, 'yyyy년 MM월 dd일')}의 회고
              </Typography>
              {todayReflection ? (
                <IconButton onClick={() => handleEditReflection(todayReflection.id)}>
                  <EditIcon />
                </IconButton>
              ) : (
                <Button variant="contained" onClick={handleNewReflection}>
                  회고 작성
                </Button>
              )}
            </Box>
            
            {todayReflection ? (
              <Box>
                <Typography variant="h6" gutterBottom>{todayReflection.title}</Typography>
                <Typography>{todayReflection.content}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">
                이 날의 회고가 없습니다.
              </Typography>
            )}
          </Paper>
        </Grid>

       
      </Grid>

     
    
      

      {/* 장기 목표 추가 다이얼로그 */}
      <Dialog open={longTermGoalDialogOpen} onClose={() => setLongTermGoalDialogOpen(false)}>
        <DialogTitle>장기 목표 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="목표"
            type="text"
            fullWidth
            value={newLongTermGoal.title}
            onChange={(e) => setNewLongTermGoal({ ...newLongTermGoal, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="연도"
            type="number"
            fullWidth
            value={newLongTermGoal.target_year}
            onChange={(e) => setNewLongTermGoal({ ...newLongTermGoal, target_year: parseInt(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="메모"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newLongTermGoal.memo}
            onChange={(e) => setNewLongTermGoal({ ...newLongTermGoal, memo: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLongTermGoalDialogOpen(false)}>취소</Button>
          <Button onClick={handleLongTermGoalSubmit} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>

      {/* 월간 목표 추가 다이얼로그 */}
      <Dialog open={monthlyGoalDialogOpen} onClose={() => setMonthlyGoalDialogOpen(false)}>
        <DialogTitle>월간 목표 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="목표"
            type="text"
            fullWidth
            value={newMonthlyGoal.title}
            onChange={(e) => setNewMonthlyGoal({ ...newMonthlyGoal, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="연도"
            type="number"
            fullWidth
            value={newMonthlyGoal.target_year}
            onChange={(e) => setNewMonthlyGoal({ ...newMonthlyGoal, target_year: parseInt(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="월"
            type="number"
            fullWidth
            value={newMonthlyGoal.target_month}
            onChange={(e) => setNewMonthlyGoal({ ...newMonthlyGoal, target_month: parseInt(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="메모"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newMonthlyGoal.memo}
            onChange={(e) => setNewMonthlyGoal({ ...newMonthlyGoal, memo: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMonthlyGoalDialogOpen(false)}>취소</Button>
          <Button onClick={handleMonthlyGoalSubmit} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>

      {/* 장기 목표 수정 다이얼로그 */}
      <Dialog open={!!editLongTermGoal} onClose={() => setEditLongTermGoal(null)}>
        <DialogTitle>장기 목표 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="목표"
            type="text"
            fullWidth
            value={editLongTermGoal?.title || ''}
            onChange={(e) => setEditLongTermGoal(prev => prev ? {...prev, title: e.target.value} : null)}
          />
          <TextField
            margin="dense"
            label="메모"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editLongTermGoal?.memo || ''}
            onChange={(e) => setEditLongTermGoal(prev => prev ? {...prev, memo: e.target.value} : null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditLongTermGoal(null)}>취소</Button>
          <Button 
            onClick={() => {
              if (editLongTermGoal) {
                updateLongTermGoal(
                  editLongTermGoal.id,
                  editLongTermGoal.title,
                  editLongTermGoal.target_year,
                  editLongTermGoal.memo
                );
                setEditLongTermGoal(null);
              }
            }} 
            variant="contained"
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>

      {/* 월간 목표 수정 다이얼로그 */}
      <Dialog open={!!editMonthlyGoal} onClose={() => setEditMonthlyGoal(null)}>
        <DialogTitle>월간 목표 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="목표"
            type="text"
            fullWidth
            value={editMonthlyGoal?.title || ''}
            onChange={(e) => setEditMonthlyGoal(prev => prev ? {...prev, title: e.target.value} : null)}
          />
          <TextField
            margin="dense"
            label="메모"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editMonthlyGoal?.memo || ''}
            onChange={(e) => setEditMonthlyGoal(prev => prev ? {...prev, memo: e.target.value} : null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMonthlyGoal(null)}>취소</Button>
          <Button 
            onClick={() => {
              if (editMonthlyGoal) {
                updateMonthlyGoal(
                  editMonthlyGoal.id,
                  editMonthlyGoal.title,
                  editMonthlyGoal.target_year,
                  editMonthlyGoal.target_month,
                  editMonthlyGoal.memo
                );
                setEditMonthlyGoal(null);
              }
            }} 
            variant="contained"
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>

      {/* 주간 목표 다이얼로그 */}
      <Dialog open={weeklyGoalDialogOpen} onClose={() => setWeeklyGoalDialogOpen(false)}>
  <DialogTitle>{editWeeklyGoal ? '주간 목표 수정' : '새 주간 목표'}</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="목표"
      fullWidth
      value={editWeeklyGoal ? editWeeklyGoal.title : newWeeklyGoal.title}
      onChange={(e) => {
        if (editWeeklyGoal) {
          setEditWeeklyGoal({ ...editWeeklyGoal, title: e.target.value });
        } else {
          setNewWeeklyGoal({ ...newWeeklyGoal, title: e.target.value });
        }
      }}
    />
    {/* 월 선택 필드 추가 */}
    <FormControl fullWidth margin="dense">
      <InputLabel>월</InputLabel>
      <Select
        value={editWeeklyGoal ? editWeeklyGoal.target_month : newWeeklyGoal.target_month}
        label="월"
        onChange={(e) => {
          const newMonth = Number(e.target.value);
          if (editWeeklyGoal) {
            setEditWeeklyGoal({ ...editWeeklyGoal, target_month: newMonth });
          } else {
            setNewWeeklyGoal({ ...newWeeklyGoal, target_month: newMonth });
          }
        }}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <MenuItem key={month} value={month}>{month}월</MenuItem>
        ))}
      </Select>
    </FormControl>
    {/* 주차 선택 필드 수정 */}
    <FormControl fullWidth margin="dense">
      <InputLabel>주차</InputLabel>
      <Select
        value={editWeeklyGoal ? editWeeklyGoal.target_week : newWeeklyGoal.target_week}
        label="주차"
        onChange={(e) => {
          const newWeek = Number(e.target.value);
          if (editWeeklyGoal) {
            setEditWeeklyGoal({ ...editWeeklyGoal, target_week: newWeek });
          } else {
            setNewWeeklyGoal({ ...newWeeklyGoal, target_week: newWeek });
          }
        }}
      >
        {Array.from(
          { length: getWeeksInMonth(selectedYear, selectedMonth) }, 
          (_, i) => i + 1
        ).map((week) => (
          <MenuItem key={week} value={week}>{selectedMonth}월 {week}주차</MenuItem>
        ))}
      </Select>
    </FormControl>
    <TextField
      margin="dense"
      label="메모"
      fullWidth
      multiline
      rows={4}
      value={editWeeklyGoal ? editWeeklyGoal.memo : newWeeklyGoal.memo}
      onChange={(e) => {
        if (editWeeklyGoal) {
          setEditWeeklyGoal({ ...editWeeklyGoal, memo: e.target.value });
        } else {
          setNewWeeklyGoal({ ...newWeeklyGoal, memo: e.target.value });
        }
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setWeeklyGoalDialogOpen(false)}>취소</Button>
    <Button onClick={handleWeeklyGoalSubmit} variant="contained">
      {editWeeklyGoal ? '수정' : '추가'}
    </Button>
  </DialogActions>
</Dialog>

      {/* 목표 메모 다이얼로그 */}
      <Dialog open={isGoalDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{selectedGoal?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {selectedGoal?.memo || '메모가 없습니다.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>닫기</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
