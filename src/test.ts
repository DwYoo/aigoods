require('dotenv').config(); // Load environment variables from .env file
import {RunpodClient} from './runpod/client';

const runpodClient:RunpodClient = new RunpodClient(process.env.INFER_ENDPOINT, process.env.TRAIN_ENDPOINT, process.env.API_KEY);

function testsync() {
    const time1 = Date.now();
    runpodClient.infersync()
    .then((response) => {
        console.log(response);
        console.log((Date.now() - time1)/1000);
    }
    )
}

testsync();