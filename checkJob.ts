require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from './src/runpod/client';

const runpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("c28754e7-ed0d-43f7-bd88-92c358ba243f-e1", 'train')
.then((response) => console.log(response))