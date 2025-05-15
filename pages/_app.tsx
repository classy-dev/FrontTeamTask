import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import theme from '../lib/theme';
import createEmotionCache from '../lib/createEmotionCache';
import { handleApiError } from '../lib/utils/error';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/router';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: handleApiError,
    },
    queries: {
      //@ts-ignore
      onError: handleApiError,
      retry: 1,
    },
  },
});

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp({ 
  Component, 
  pageProps, 
  emotionCache = clientSideEmotionCache 
}: MyAppProps) {
  const router = useRouter();
  const isAiChatPage = router.pathname === '/ai-chat';

  return (
    <CacheProvider value={emotionCache}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <MainLayout noPadding={isAiChatPage}>
          <Component {...pageProps} />
          </MainLayout>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ThemeProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
}
