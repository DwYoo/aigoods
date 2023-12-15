import express from 'express';
import https from 'https';
import fs from 'fs';
import router from './routes/index'; // 라우터 경로에 따라 조정하세요.
require('dotenv').config(); 


const app = express();

app.use(express.json());

app.use('/', router);

const options = {
  key: fs.readFileSync(String(process.env.KEY_PATH)), 
  cert: fs.readFileSync(String(process.env.CERT_PATH)) 
};

https.createServer(options, app).listen(3000, () => {
  console.log(`Server is running on https://api.pets-mas.com:443`);
});