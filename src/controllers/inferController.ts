import { Request, Response } from "express";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";

import { RunpodClient } from "../runpod/client";
import cloudinary from '../cloudinary/config'; // Import the Cloudinary configuration
import {PrismaClient, User } from '../../prisma/generated/client'
import {s3Client,} from "../s3/client"
import FormData from 'form-data';
import { Readable } from 'stream';
import { UploadApiResponse } from "cloudinary";

require('dotenv').config();

const IMAGE_PER_COUNT:number = 3
const MAX_PLAY_COUNT: number = 3

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
          playCount: true,
          trainImageSet: true
        }
      });
      let playCount: number = 0; 
      let petName: string = "";


      if (user && user.trainImageSet) {
        playCount = user.playCount;
        petName = user.trainImageSet.petName
      } else {
        console.log("User not found");
        res.status(404).json({
          message: "User not found"
        })
        return;
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
          createdAt: 'asc' // 최신순으로 정렬
        },
        skip: IMAGE_PER_COUNT * playCount,
        take: IMAGE_PER_COUNT 
      });

      const imageUrls = await Promise.all(
        genImages.map(async (image:any) => {
          const command = new GetObjectCommand({
            Bucket: String(process.env.S3_BUCKET_NAME),
            Key: `pets-mas/${image.filePath}`
          });
  
          const { Body } = await s3Client.send(command);
  
          const imageUrl = await uploadToCloudinary(Body as Readable);
          return {
            id: image.id,
            url: imageUrl
          };
        })
      );
  
      let jsonResponse: { [key: string]: string } = {};
      imageUrls.forEach(image => {
        jsonResponse[image.id] = image.url;
      });

      jsonResponse['petName'] = petName;
      res.json(jsonResponse);
      console.log(jsonResponse)
    
  } catch (err) {
      console.error(err);
      res.status(500).json({
          message: "Internal Server Error"
      });
  }
}

  async getAllGenImages(req: Request, res: Response) {
    try {
      const userId: string = req.params.user_id;
      const user = await prisma.user.findFirst({
        where: {
          id: userId
        },
        select: {
          playCount: true,
          trainImageSet: true
        },
      });
      let playCount: number = 0; 
      let petName: string = "";

      if (user && user.trainImageSet) {
        playCount = user.playCount;
        petName = user.trainImageSet.petName
      } else {
        console.log("User not found");
        res.status(404).json({
          message: "User not found"
        })
        return;
      }

      if (playCount >= MAX_PLAY_COUNT) {
        res.status(429).json({
          message: "User play count exceeded"
        })
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
          createdAt: 'asc' // 최신순으로 정렬
        },
        take: IMAGE_PER_COUNT * playCount
      });

      const imageUrls = await Promise.all(
        genImages.map(async (image:any) => {
          const command = new GetObjectCommand({
            Bucket: String(process.env.S3_BUCKET_NAME),
            Key: `pets-mas/${image.filePath}`
          });
  
          const { Body } = await s3Client.send(command);
  
          const imageUrl = await uploadToCloudinary(Body as Readable);
          return {
            id: image.id,
            url: imageUrl
          };
        })
      );
  
      let jsonResponse: { [key: string]: string } = {};
      imageUrls.forEach(image => {
        jsonResponse[image.id] = image.url;
      });
      jsonResponse['petName'] = petName
      
      res.json(jsonResponse);
      console.log(jsonResponse)
  } catch (err) {
      console.error(err);
      res.status(500).json({
          message: "Internal Server Error"
      });
  }
  }
}

async function uploadToCloudinary(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    let cloudStream = cloudinary.uploader.upload_stream((error, result:UploadApiResponse) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result.url);
    });

    stream.pipe(cloudStream);
  });
}
