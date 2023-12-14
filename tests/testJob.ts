require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from '../src/runpod/client';

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("05e4777b-a85f-40f1-815a-2c3277d5c115-e1", 'train')
.then((response) => console.log(response))