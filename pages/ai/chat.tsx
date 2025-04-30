import { Layout } from '@/components/layout';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { Box, Typography } from '@mui/material';

export default function ChatPage() {
  return (
    <Layout>
      <Box sx={{ p: 4, maxWidth: '1000px', mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          AI 챗봇
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          목표 설정과 달성에 대해 AI와 대화하세요. 조언, 분석, 추천을 받을 수 있습니다.
        </Typography>
        <ChatInterface />
      </Box>
    </Layout>
  );
}
