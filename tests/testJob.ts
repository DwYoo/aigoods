require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from '../src/runpod/client';

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

runpodClient.checkJobStatus("299dba26-ef97-4100-a2d6-032f28d25535-e1", 'infer')
.then((response) => console.log(response))