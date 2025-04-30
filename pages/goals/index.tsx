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

interface LongTermGoal {
  id: number;
  title: string;
  target_year: number;
  created_at: string;
  updated_at: string;
}

interface MonthlyGoal {
  id: number;
  title: string;
  target_year: number;
  target_month: number;
  created_at: string;
  updated_at: string;
}

export default function GoalsPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedView, setSelectedView] = useState<ViewType>('today');

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
  const [newLongTermGoal, setNewLongTermGoal] = useState('');
  const [editLongTermGoal, setEditLongTermGoal] = useState<LongTermGoal | null>(null);
  const { goals: longTermGoals, createGoal: createLongTermGoal, updateGoal: updateLongTermGoal, deleteGoal: deleteLongTermGoal } = useLongTermGoals(selectedYear);

  // 월간 목표 상태
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthlyGoalDialogOpen, setMonthlyGoalDialogOpen] = useState(false);
  const [newMonthlyGoal, setNewMonthlyGoal] = useState('');
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

  const handleGoalClick = (id: number) => {
    router.push(`/goals/${id}`);
  };

  const handleLongTermGoalSubmit = async () => {
    if (!newLongTermGoal.trim()) return;
    try {
      await createLongTermGoal(newLongTermGoal, selectedYear);
      setNewLongTermGoal('');
      setLongTermGoalDialogOpen(false);
    } catch (error) {
      console.error('Error creating long term goal:', error);
    }
  };

  const handleMonthlyGoalSubmit = async () => {
    if (!newMonthlyGoal.trim()) return;
    try {
      await createMonthlyGoal(newMonthlyGoal, selectedYear, selectedMonth);
      setNewMonthlyGoal('');
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

  const tabs = ['오늘', '내일', '2일 후', '3일 후', '1주', '1개월', '1년'];

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
        newDate.setDate(today.getDate() + 7);
        break;
      case 5: // 1개월
        newView = 'month';
        newDate.setMonth(today.getMonth() + 1);
        break;
      case 6: // 1년
        newView = 'year';
        newDate.setFullYear(today.getFullYear() + 1);
        break;
    }
    
    setSelectedDate(newDate);
    setSelectedView(newView);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">목표 관리</Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/goals/new')}
        >
          새 목표 추가
        </Button>
      </Box>

      {/* 장기 목표와 월간 목표 섹션 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
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

      <Grid container spacing={3}>
        {/* 진행 중인 목표 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              진행 중인 목표
            </Typography>
            {inProgressGoals.map((goal) => (
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
                onClick={() => handleGoalClick(goal.id)}
              >
                <Box>
                  <Typography>{goal.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(goal.start_date as Date), 'HH:mm')} - {format(new Date(goal.end_date as Date), 'HH:mm')}
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
            {completedGoals.map((goal) => (
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
                onClick={() => handleGoalClick(goal.id)}
              >
                <Box>
                  <Typography>{goal.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(goal.start_date as Date), 'HH:mm')} - {format(new Date(goal.end_date as Date), 'HH:mm')}
                  </Typography>
                </Box>
              </Box>
            ))}
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
        <DialogTitle>{selectedYear}년 목표 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="목표"
            fullWidth
            value={newLongTermGoal}
            onChange={(e) => setNewLongTermGoal(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLongTermGoalDialogOpen(false)}>취소</Button>
          <Button onClick={handleLongTermGoalSubmit} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>

      {/* 월간 목표 추가 다이얼로그 */}
      <Dialog open={monthlyGoalDialogOpen} onClose={() => setMonthlyGoalDialogOpen(false)}>
        <DialogTitle>{selectedYear}년 {selectedMonth}월 목표 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="목표"
            fullWidth
            value={newMonthlyGoal}
            onChange={(e) => setNewMonthlyGoal(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMonthlyGoalDialogOpen(false)}>취소</Button>
          <Button onClick={handleMonthlyGoalSubmit} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>

      {/* 장기 목표 수정 다이얼로그 */}
      <Dialog open={!!editLongTermGoal} onClose={() => setEditLongTermGoal(null)}>
        <DialogTitle>{selectedYear}년 목표 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="목표"
            fullWidth
            value={editLongTermGoal?.title || ''}
            onChange={(e) => setEditLongTermGoal(prev => prev ? {...prev, title: e.target.value} : null)}
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
                  editLongTermGoal.target_year
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
        <DialogTitle>{selectedYear}년 {selectedMonth}월 목표 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="목표"
            fullWidth
            value={editMonthlyGoal?.title || ''}
            onChange={(e) => setEditMonthlyGoal(prev => prev ? {...prev, title: e.target.value} : null)}
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
                  editMonthlyGoal.target_month
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

    </Container>
  );
}
