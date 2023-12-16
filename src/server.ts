import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import router from './routes/index';
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors());

app.use('/', router);

const privateKey = fs.readFileSync(String(process.env.PATH_TO_KEY), 'utf8');
const certificate = fs.readFileSync(String(process.env.PATH_TO_CERT), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
  console.log(`Server is running on https://api.pets-mas.com:${PORT}`);
});