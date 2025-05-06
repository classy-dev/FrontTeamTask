import { ReactNode, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Flag as FlagIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  Lightbulb as IdeaIcon,
  Link as LinkIcon,
  MenuBook as GuideIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Favorite as WeddingIcon,
  Assignment as MissionIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUser, getAuthToken } from '@/lib/api/auth';

const drawerWidth = 280;

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'noPadding',
})<{
  open?: boolean;
  noPadding?: boolean;
}>(({ theme, open, noPadding }) => ({
  position: 'relative',
  flexGrow: 1,
  padding: noPadding ? 0 : theme.spacing(3),
  height: '100vh',  
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.up('sm')]: {
    marginLeft: open ? `${drawerWidth}px` : 0,
    width: `calc(100% - ${open ? drawerWidth : 0}px)`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: noPadding ? 0 : theme.spacing(2),
    marginTop: '64px',
  },
}));

interface MainLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
}

const menuItems = [ 
  { text: '목표 목록', icon: <FlagIcon />, href: '/', emoji: '🎯' },
  { text: 'AI Chat', icon: <HomeIcon />, href: '/ai-chat', emoji: '🏠' }, 
  { text: '메모 게시판', icon: <IdeaIcon />, href: '/boards?type=idea', emoji: '💡' },
  { text: '데일리 미션', icon: <MissionIcon />, href: '/boards?type=dailyMission', emoji: '✨' },
  { text: '링크 게시판', icon: <LinkIcon />, href: '/links', emoji: '🔗' },
  { text: '정보 게시판', icon: <InfoIcon />, href: '/boards?type=info', emoji: '📢' },  
  { text: '회고 게시판', icon: <HistoryIcon />, href: '/boards?type=reflection', emoji: '📝' },  
  { text: '카테고리 관리', icon: <CategoryIcon />, href: '/categories', emoji: '📁' },
  { text: '프로필 관리', icon: <PersonIcon />, href: '/profile', emoji: '👤' },
];

export default function MainLayout({ children, noPadding }: MainLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<any>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // 인증 체크 및 사용자 정보 로드
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      const currentPath = router.pathname;
      
      // 로그인이 필요하지 않은 페이지들
      const publicPages = ['/login', '/register'];
      const isPublicPage = publicPages.includes(currentPath);

      if (!token && !isPublicPage) {
        router.push('/login');
        return;
      }

      if (token && isPublicPage) {
        router.push('/');
        return;
      }

      if (token) {
        setUser(getUser());
      }
    };

    checkAuth();
  }, [router.pathname]);

  const handleLogout = () => {
    logout();
  };

  const drawerContent = (
    <Box sx={{ width: drawerWidth, pt: 2 }}>
      {/* 사용자 정보 */}
      <Box sx={{ px: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar>{user?.username?.[0] || 't'}</Avatar>
          <Typography>👤 {user?.username || '사용자'}</Typography>
        </Box>
        <IconButton onClick={handleLogout} color="inherit" title="로그아웃">
          <LogoutIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 메뉴 목록 */}
      <List>
        {menuItems.map((item) => (
          <Link
            key={item.text}
            href={item.href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItem disablePadding>
              <ListItemButton
                selected={router.pathname === item.href}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mr: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.emoji} {item.text}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Goal AI
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Main open={!isMobile || mobileOpen} noPadding={noPadding}>
        {children}
      </Main>
    </Box>
  );
}
