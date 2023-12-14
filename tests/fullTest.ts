import axios from "axios";

import {RunpodClient} from '../src/runpod/client';
require('dotenv').config(); // Load environment variables from .env file
const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);
