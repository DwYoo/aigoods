require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from './src/runpod/client';

const runpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("afc77e7c-419e-481f-8b07-721f80680b09-e1", 'train')
.then((response) => console.log(response))