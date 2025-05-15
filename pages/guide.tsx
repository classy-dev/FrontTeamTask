import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';

export default function GuidePage() {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🎯 목표 달성 AI 사용 가이드
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 기본 대화 기능 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              💬 기본 대화 기능
            </Typography>
            <Typography>
              AI 컨설턴트와 자연스러운 대화를 나눌 수 있습니다. 목표 설정이나 일상적인 대화 모두 가능합니다.
            </Typography>
          </Paper>

          {/* 검색 기능 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              🔍 검색 기능
            </Typography>
            <Typography gutterBottom>
              검색어 뒤에 &quot;검색해줘&quot;를 붙여서 사용합니다.
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;목표 달성 방법 검색해줘&quot;<br />
              • &quot;타임 매니지먼트 팁 검색해줘&quot;
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              검색 결과 저장
            </Typography>
            <Typography gutterBottom>
              검색한 결과를 게시판에 저장할 수 있습니다.
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;방금 검색 결과 정보 게시판에 올려줘&quot;<br />
              • &quot;제목은 목표 달성 팁으로 방금 검색 결과 정보 게시판에 올려줘&quot;
            </Typography>
          </Paper>

          {/* 목표 추가 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              🎯 목표 추가
            </Typography>
            <Typography gutterBottom>
              다양한 형식으로 목표를 추가할 수 있습니다.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              기본 형식
            </Typography>
            <Typography gutterBottom>
              &quot;[목표] 추가해줘&quot;
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;운동하기 추가해줘&quot;<br />
              • &quot;독서하기 추가해줘&quot;
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              카테고리 지정
            </Typography>
            <Typography gutterBottom>
              &quot;[카테고리명](카테고리) [목표] 추가해줘&quot;
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;건강(카테고리) 운동하기 추가해줘&quot;<br />
              • &quot;학습(카테고리) 영어 공부하기 추가해줘&quot;
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              날짜와 시간 지정
            </Typography>
            <Typography gutterBottom>
              목표의 날짜와 시간을 다양한 방식으로 지정할 수 있습니다.
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              날짜 지정 예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;내일 운동하기 추가해줘&quot;<br />
              • &quot;모레 영어 공부하기 추가해줘&quot;<br />
              • &quot;다음주 독서하기 추가해줘&quot;<br />
              • &quot;11월 25일 면접보기 추가해줘&quot;
            </Typography>

            <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 1 }}>
              시간 지정 예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;저녁 8시 10분에 운동하기 추가해줘&quot;<br />
              • &quot;오후 3시 30분에 회의하기 추가해줘&quot;<br />
              • &quot;12시 정각에 점심 약속 추가해줘&quot;
            </Typography>

            <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 1 }}>
              날짜와 시간 조합 예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;내일 오후 3시 30분에 미팅하기 추가해줘&quot;<br />
              • &quot;11월 25일 12시에 면접보기 추가해줘&quot;<br />
              • &quot;모레 저녁 8시에 약속 잡기 추가해줘&quot;
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              * 날짜나 시간을 지정하지 않으면 기본값으로 오늘 오전 9시로 설정됩니다.<br />
              * 시간만 지정하면 오늘 해당 시간으로 설정됩니다.<br />
              * 1~11시는 문맥에 따라 오전/오후가 자동으로 설정됩니다.
            </Typography>
          </Paper>

          {/* 게시판 기능 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              📝 게시판 기능
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              정보 게시판
            </Typography>
            <Typography gutterBottom>
              유용한 정보나 검색 결과를 저장할 수 있습니다.
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;[내용] 정보 게시판에 올려줘&quot;<br />
              • &quot;제목은 [제목] 로 [내용] 정보 게시판에 올려줘&quot;
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              아이디어 게시판
            </Typography>
            <Typography gutterBottom>
              새로운 아이디어나 계획을 기록할 수 있습니다.
            </Typography>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              예시:
            </Typography>
            <Typography component="div" sx={{ pl: 2 }}>
              • &quot;[아이디어] 아이디어 게시판에 올려줘&quot;<br />
              • &quot;제목은 [제목] 로 [아이디어] 아이디어 게시판에 올려줘&quot;
            </Typography>
          </Paper>

          {/* 팁 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              💡 유용한 팁
            </Typography>
            <Typography component="div">
              • 명령어들은 자연스러운 대화 형식으로 조합해서 사용할 수 있습니다.<br />
              • 카테고리를 활용하면 목표를 체계적으로 관리할 수 있습니다.<br />
              • 날짜와 시간을 지정하지 않으면 현재 시점으로 설정됩니다.<br />
              • 검색 결과는 바로 게시판에 저장할 수 있습니다.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </MainLayout>
  );
}
