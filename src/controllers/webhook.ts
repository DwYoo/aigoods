import { Request, Response } from "express";
import axios from 'axios';

import {PrismaClient } from '../../prisma/generated/client'

const prisma:PrismaClient = new PrismaClient()

class WebhookController {
    public async handleTrainComplete(req: Request, res: Response): Promise<void> {
      const userId:string = req.params.user_id;
      console.log(`Train Webhook received for user ${userId}:`, req.body);
      if (req.body["output"]["status"] !== 'COMPLETED') {
        throw Error("Error occured while training in runpod")
      }
      const zipfilePath: string = req.body["input"]["zipfile_path"]
      const loraPath : string = req.body["output"]["model_path"];

      let trainImageSet = await prisma.trainImageSet.findFirst({
        where: {
          zipPath: zipfilePath,
        },
        include: {
          lora: true // Lora 객체를 포함하여 가져옵니다.
        }
      });
    
      if (!trainImageSet) {
        throw Error(`No TrainImageSet found for user: ${userId}`)
      }
      let lora;
      if (trainImageSet.lora) {
        // Lora 객체가 이미 존재하는 경우, 업데이트
        lora = await prisma.lora.update({
          where: {
            id: trainImageSet.lora.id
          },
          data: {
            path: loraPath
          }
        });
      } else {
        // Lora 객체가 존재하지 않는 경우, 새로 생성
        lora = await prisma.lora.create({
          data: {
            trainImageSetId: trainImageSet.id,
            path: loraPath
          }
        });
      }
      axios.post(`http://api.pets-mas.com:3000/users/${userId}/gen-images`)
      res.status(200).send("Webhook processed");
    }

    public async handleInferComplete(req: Request, res: Response): Promise<void> {
      const userId:string = req.params.user_id;
      console.log(`Infer webhook received for user ${userId}:`, req.body);
      res.status(200).send("Webhook processed");
    }
}

export {WebhookController};