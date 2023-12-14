require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from '../src/runpod/client';

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);


async function test() {
    const response: any = await runpodClient.train("test/datasets/ms.zip", "test/output", "http://api.pets-mas.com:3000/webhook/train")  
    console.log(response)
    return response
}

function sleep(s: number) {
    return new Promise(resolve => setTimeout(resolve, 1000* s));
}

test().then((response) => {
    console.log(response)
})


