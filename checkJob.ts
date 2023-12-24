require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from './src/runpod/client';

const runpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("57f0e8ce-ecc1-49c2-be1c-cf3f4cb1d564-e1", 'train')
.then((response) => console.log(response))