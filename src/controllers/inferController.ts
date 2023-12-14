import { Request, Response } from "express";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { RunpodClient } from "../runpod/client";
import { PrismaClient, TrainImage } from '../../prisma/generated/client'
import {s3Client} from "../s3/client"

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);
require('dotenv').config();

const prisma:PrismaClient = new PrismaClient()

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
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      if (!lora) {
        return res.status(404).json({
          message: "Lora object not found for the user."
        });
      }

      const response = await runpodClient.infer(
        lora.path, 
        `${userId}/gen_images`,
         `http://api.pets-mas.com/webhook/infer/${userId}`
         )
  
      res.status(200).json({
        message: "Successfully sent request to runpod",
        runpodResponse: response
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!"
      });
    }
  }

  async getGenImages(req: Request, res: Response) {
    try {
      const userId: string = req.params.user_id;
      const genImages = await prisma.genImage.findMany({
        where: {
          lora: {
            trainImageSet: {
              userId: userId
            }
          }
        }
      });
  
      // gen_image에 대한 URL 생성
      const imageUrls = await Promise.all(genImages.map(image =>
        getSignedUrl(s3Client, new GetObjectCommand({
          Bucket: String(process.env.S3_BUCKET_NAME),
          Key: image.filePath
        }), { expiresIn: 180 })
      ));
  
      // 이미지 ID와 URL을 매핑
      const imageUrlsMap = genImages.reduce<{ [key: number]: string }>((acc, image, index) => {
        acc[image.id] = imageUrls[index];
        return acc;
      }, {});
  
      res.status(200).send(res.send(imageUrlsMap));
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }
}