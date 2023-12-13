require('dotenv').config(); // Load environment variables from .env file
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

function test() {
    const time1 = Date.now();
    runpodClient.infer("test/output", "https://api.pets-mas.com:3000/webhook/infer")
    .then((response) => {
        console.log(response);
        console.log((Date.now() - time1)/1000);
    }
    )
}

test();