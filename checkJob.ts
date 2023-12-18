require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from './src/runpod/client';

const runpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("7e250e40-c142-43b5-a594-bb20f9af9df6-e1", 'train')
.then((response) => console.log(response))