import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import cors from 'cors';
import {router, webhookRouter} from './routes/index';
require('dotenv').config();


const webhook = express()
webhook.use(express.json());
webhook.use('/', webhookRouter);
const httpServer = http.createServer(webhook);

httpServer.listen(3100, () => {
  console.log(`Webhook Server is running on http://api.pets-mas.com:3100`);
});


const app = express();
app.use(express.json());
app.use(cors());
app.use('/', router);

const privateKey = fs.readFileSync(String(process.env.PATH_TO_KEY), 'utf8');
const certificate = fs.readFileSync(String(process.env.PATH_TO_CERT), 'utf8');
const caBundle = fs.readFileSync(String(process.env.PATH_TO_CA_BUNDLE), 'utf8');

const credentials = { 
  key: privateKey, 
  cert: certificate,
  ca: caBundle // 중간 인증서 추가
};
const httpsServer = https.createServer(credentials, app);

const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
  console.log(`Server is running on https://api.pets-mas.com:${PORT}`);
});

