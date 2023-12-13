import express from 'express';
import router from './routes/index';

// Express 애플리케이션 생성
const app = express();

// 라우터를 사용하여 경로를 설정
app.use('/', router);

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});