require('dotenv').config(); // Load environment variables from .env file
import { time } from 'console';
import {RunpodClient} from './runpod/client';

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

function testsync() {
    const time1 = Date.now();
    runpodClient.infersync("test/output")
    .then((response) => {
        console.log(response);
        console.log((Date.now() - time1)/1000);
    }
    )
}

interface JobStatusResponse {
    id: string;
    status: string;
    delayTime?: number;
    executionTime?: number;
    output?: Array<{ image: string; seed: number }>;
}
interface InferResponse {
    id: string;
    status: string;
}
async function test() {
    const response: InferResponse = await runpodClient.infer("test/output", "https://api.pets-mas.com:3000/webhook/infer")  
    console.log(response)
    sleep(5)
    const jobStatus = await runpodClient.checkInferStatus(response["id"])

    return jobStatus
}

function sleep(s: number) {
    return new Promise(resolve => setTimeout(resolve, 1000* s));
}

test().then((jobStatus) => {
    console.log(jobStatus)
})


