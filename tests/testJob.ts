require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from '../src/runpod/client';

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("00bd78db-4644-4303-a55d-26579c90d2b8-e1", 'train')
.then((response) => console.log(response))