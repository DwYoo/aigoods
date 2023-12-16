require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from '../src/runpod/client';

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("02cb6902-7005-4da5-b83b-79cb463f48aa-e1", 'infer')
.then((response) => console.log(response))