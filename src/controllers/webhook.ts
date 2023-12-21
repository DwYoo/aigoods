import { Request, Response } from "express";
import axios from 'axios';

import { RunpodClient } from "../runpod/client";

import {PrismaClient, User } from '../../prisma/generated/client';
import { sendMail } from "../utils/mail";
require('dotenv').config();


const prisma:PrismaClient = new PrismaClient();
const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

class WebhookController {
    public async handleTrainComplete(req: Request, res: Response): Promise<any> {
      const userId:string = req.params.user_id;
      console.log(`Train Webhook received for user ${userId}:`, JSON.stringify(req.body));
      try {console.log(req.body.status)
        if (req.body.status !== 'COMPLETED') {
          console.log("Error while training in runpod")
        } 
      } catch (error) {
          console.log(error)
        }
      const loraPath : string = req.body.output.model_path;

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
          },
          include: {
            trainImageSet: true
          }
        });
      } else {
        // Lora 객체가 존재하지 않는 경우, 새로 생성
        lora = await prisma.lora.create({
          data: {
            trainImageSetId: trainImageSet.id,
            path: loraPath
          },
          include: {
            trainImageSet: true
          }
        });
      }

      const runpodResponse:any = await runpodClient.inferBatch(
        lora.trainImageSet.petClass,
        lora.path, 
        `users/${userId}/gen_images`,
         `${process.env.WEBHOOK_ENDPOINT}/webhook/infer/${userId}`,
         12
         )

      res.status(200).send("Webhook processed");
    }

    public async handleInferComplete(req: Request, res: Response): Promise<void> {
      const userId: string = req.params.user_id;
      console.log(`Infer webhook received for user ${userId}:`, req.body);

      if (req.body.status === 'FAILED' && req.body.error === "Max retries reached while waiting for image generation") {
        console.error('Infer operation did not complete successfully.');
      }

      else if (req.body.status !== 'COMPLETED' || req.body.output.status !== 'success') {
        console.error('Infer operation did not complete successfully');
        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            userStatus: 3,
          }
        })
        res.status(500).send('Infer operation failed');
        return;
      }
      try {
        let user = await prisma.user.findFirst({
          where: {
            id: userId
          },
        })
    
        const imageUrls: string[] = req.body.output.message;
        // 사용자의 Lora 객체와 연결된 TrainImageSet 찾기
        const trainImageSet = await prisma.trainImageSet.findFirst({
          where: { userId: userId },
          include: { lora: true }
        });
  
        if (!trainImageSet || !trainImageSet.lora) {
          throw new Error(`No Lora information found for user: ${userId}`);
        }
  
        for (const imageUrl of imageUrls) {
          const pngIndex = imageUrl.indexOf('.png');
          const endOfPng = pngIndex + 4; 
          
          const partialUrl = imageUrl.substring(0, endOfPng);
          const basePath = 'https://pets-mas.s3.ap-northeast-2.amazonaws.com/pets-mas/';
          const filePath = partialUrl.replace(basePath, '');
        
          await prisma.genImage.create({
            data: {
              loraId: trainImageSet.lora.id,
              filePath: filePath // 추출한 파일 이름 사용
            }
          });

          user = await prisma.user.update({
            where: {
              id: userId
            },
            data: {
              inferSuccess: {
                increment: 1
              }          
            }
          })
          if (user.inferSuccess) {
            if (Math.abs(user.inferSuccess - 9) < 0.1) {
              await prisma.user.update({
                where: {
                  id: userId
                },
                data: {
                  userStatus: 2
                }
              });
              const userEmail:string|null = user.email;
              if (userEmail) {
                console.log(`sending email to ${userEmail}`)
                await sendMail(userEmail, "메리 댕냥스마스!", `www.pets-mas.com/${userId}`)
              } else {
                console.log("User email does not exist")
              }
            }
         }
        }
        res.status(200).send("Infer Webhook processed");
      } catch (error) {
        console.error(`Error while processing infer webhook: ${error}`);
        res.status(500).send("Error processing webhook");
      }
    }
  }


export {WebhookController};