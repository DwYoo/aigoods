import { Request, Response } from "express";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { RunpodClient, RunpodResponse } from "../runpod/client";
import {PrismaClient, User } from '../../prisma/generated/client'
import {s3Client} from "../s3/client"

require('dotenv').config();

const IMAGE_PER_COUNT:number = 3

const prisma:PrismaClient = new PrismaClient()

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);

export default class InferController {
  async infer(req: Request, res: Response) {
    try {
      const userId:string = req.params.user_id;
      const lora = await prisma.lora.findFirst({
        where: {
          trainImageSet: {
            userId: userId
          }
        },
        include: {
          trainImageSet: true // 이 부분을 추가합니다.
        }
      });
  
      if (!lora) {
        return res.status(404).json({
          message: "Lora object not found for the user."
        });
      }

      const runpodJobs = await runpodClient.inferBatch(
        lora.trainImageSet.petClass,
        lora.path, 
        `users/${userId}/gen_images`,
        `${process.env.WEBHOOK_ENDPOINT}/webhook/infer/${userId}`,
        3
        )

      console.log(runpodJobs)

      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          currentJobId: runpodJobs[runpodJobs.length-1].id
        }
      })
  
      res.status(200).json({
        message: "Successfully sent request to runpod",
        runpodJobs: runpodJobs
      });
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: `Internal Server Error!: ${err}`
      });
    }
  }

  async getGenImages(req: Request, res: Response) {
    try {
      const userId: string = req.params.user_id;
      const user = await prisma.user.findFirst({
        where: {
          id: userId
        },
        select: {
          playCount: true
        }
      });
      let playCount: number = 0; 

      if (user) {
        playCount = user.playCount;
      } else {
        console.log("User not found");
      }

      const genImages = await prisma.genImage.findMany({
        where: {
          lora: {
            trainImageSet: {
              userId: userId
            }
          }
        },
        orderBy: {
          createdAt: 'desc' // 최신순으로 정렬
        },
        skip: IMAGE_PER_COUNT * playCount,
        take: IMAGE_PER_COUNT 
      });

      // gen_image에 대한 URL 생성
      const imageUrls = await Promise.all(genImages.map(image =>
        getSignedUrl(s3Client, new GetObjectCommand({
          Bucket: String(process.env.S3_BUCKET_NAME),
          Key: `pets-mas/${image.filePath}`
        }), { expiresIn: 604800 })
      ));
  
      // 이미지 ID와 URL을 매핑
      const imageUrlsMap = genImages.reduce<{ [key: string]: string }>((acc, image, index) => {
        acc[String(image.id)] = imageUrls[index];
        return acc;
      }, {});
      console.log(`response: ${JSON.stringify(imageUrlsMap)}`)
  
      res.status(200).json(JSON.stringify(imageUrlsMap))
      
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          playCount: {
            increment: 1
          }          
        }
      })

    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }
}