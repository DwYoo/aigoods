import {PrismaClient, TrainImage } from './prisma/generated/client'

import { RunpodClient, RunpodResponse } from "./src/runpod/client";
import {s3Client, uploadTrainImageSet, uploadZip, generateSignedUrls} from "./src/utils/s3/client"
require('dotenv').config();

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);
const prisma:PrismaClient = new PrismaClient();

async function main() {
  const userId = 'clqiwzl21000476qx3fea4l8w'
// const runpodResponse:RunpodResponse = await runpodClient.train(
//     `lora_${Date.now()}`,
//     'dog',
//     'users/clqiwzl21000476qx3fea4l8w/train/1703387799747_images.zip', 
//     `users/${userId}/lora`,
//     `${process.env.WEBHOOK_ENDPOINT}/webhook/train/${userId}`
//     )

  await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        userStatus: 0,
        playCount: 0,
        inferSuccess: 0,
      }
    })
    
  }

  main()
