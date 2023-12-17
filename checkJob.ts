require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from './src/runpod/client';

const runpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("ea285451-1c67-4a43-8c39-0f0354391035-e1", 'train')
.then((response) => console.log(response))