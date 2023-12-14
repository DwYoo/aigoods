import { Request, Response } from "express";
import axios from 'axios';

import {PrismaClient } from '../../prisma/generated/client';

const prisma:PrismaClient = new PrismaClient();

class WebhookController {
    public async handleTrainComplete(req: Request, res: Response): Promise<any> {
      const userId:string = req.params.user_id;
      console.log(`Train Webhook received for user ${userId}:`, req.body);
      try {console.log(req.body.status)
        if (req.body.status !== 'COMPLETED') {
          console.log("Error while training in runpod")
        } 
      } catch (error) {
          console.log(error)
        }
      const zipfilePath: string = req.body.input.zipfile_path
      const loraPath : string = req.body.output.model_path;

      console.log(`zipfilePath: ${zipfilePath}, loraPath: ${loraPath}`)

      let trainImageSet = await prisma.trainImageSet.findFirst({
        where: {userId: userId},
        include: {
          lora: true // Lora 객체를 포함하여 가져옵니다.
        }
      });
    
      if (!trainImageSet) {
        throw Error(`No TrainImageSet found for userId: ${userId}`)
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
      const userId: string = req.params.user_id;
      console.log(`Infer webhook received for user ${userId}:`, req.body);
  
      if (req.body.status !== 'COMPLETED' || req.body.output.status !== 'success') {
        console.error('Infer operation did not complete successfully');
        res.status(500).send('Infer operation failed');
        return;
      }
  
      const imageUrls: string[] = req.body.output.message;
  
      try {
        // 사용자의 Lora 객체와 연결된 TrainImageSet 찾기
        const trainImageSet = await prisma.trainImageSet.findFirst({
          where: { userId: userId },
          include: { lora: true }
        });
  
        if (!trainImageSet || !trainImageSet.lora) {
          throw new Error(`No Lora information found for user: ${userId}`);
        }
  
        // GenImage 객체들을 데이터베이스에 저장
        for (const imageUrl of imageUrls) {
          // URL 객체를 사용하여 전체 경로 추출
          const pngIndex = imageUrl.indexOf('.png');
          const endOfPng = pngIndex + 4; // '.png'를 포함하기 위해 +4
          
          // 필요한 부분만 잘라내기
          const partialUrl = imageUrl.substring(0, endOfPng);
          const basePath = 'https://pets-mas.s3.ap-northeast-2.amazonaws.com/pets-mas/';
          const filePath = partialUrl.replace(basePath, '');
        
          await prisma.genImage.create({
            data: {
              loraId: trainImageSet.lora.id,
              filePath: filePath // 추출한 파일 이름 사용
            }
          });
        }
        res.status(200).send("Infer Webhook processed");
      } catch (error) {
        console.error(`Error while processing infer webhook: ${error}`);
        res.status(500).send("Error processing webhook");
      }
    }
  }


export {WebhookController};