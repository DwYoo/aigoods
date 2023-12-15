import express from 'express';
import router from './routes/index';

// Express 애플리케이션 생성
const app = express();
app.use(express.json());
// catch 404 and forward to error handler

// 라우터를 사용하여 경로를 설정
app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://api.pets-mas.com:${PORT}`);
});