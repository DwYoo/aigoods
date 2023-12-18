import { Request, Response } from "express";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";

import { RunpodClient, RunpodResponse } from "../runpod/client";
import {PrismaClient, User } from '../../prisma/generated/client'
import {s3Client,} from "../s3/client"
import FormData from 'form-data';
import { Readable } from 'stream';

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

      const imageBuffers: { id: number; buffer: Buffer; contentType: string }[] = await Promise.all(
        genImages.map(async (image) => {
            const command = new GetObjectCommand({
                Bucket: String(process.env.S3_BUCKET_NAME),
                Key: `pets-mas/${image.filePath}`
            });
            const { Body } = await s3Client.send(command);
            return {
                id: image.id,
                buffer: await streamToBuffer(Body as Readable),
                contentType: 'image/jpeg' // 실제 타입은 파일에 따라 다를 수 있습니다.
            };
        })
    );

    const formData = new FormData();
    imageBuffers.forEach((image, index) => {
        formData.append(`image${index}`, image.buffer, {
            filename: `image${index}.jpeg`,
            contentType: image.contentType
        });
    });

    res.setHeader('Content-Type', `multipart/form-data; boundary=${formData.getBoundary()}`);
    formData.pipe(res);

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
          playCount: true
        }
      });
      let playCount: number = 0; 

      if (user) {
        playCount = user.playCount;
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
        take: IMAGE_PER_COUNT * (playCount +1)
      });

      const imageBuffers: { id: number; buffer: Buffer; contentType: string }[] = await Promise.all(
        genImages.map(async (image) => {
            const command = new GetObjectCommand({
                Bucket: String(process.env.S3_BUCKET_NAME),
                Key: `pets-mas/${image.filePath}`
            });
            const { Body } = await s3Client.send(command);
            return {
                id: image.id,
                buffer: await streamToBuffer(Body as Readable),
                contentType: 'image/jpeg' // 실제 타입은 파일에 따라 다를 수 있습니다.
            };
        })
    );

    const formData = new FormData();
    imageBuffers.forEach((image, index) => {
        formData.append(`image${index}`, image.buffer, {
            filename: `image${index}.jpeg`,
            contentType: image.contentType
        });
    });

    res.setHeader('Content-Type', `multipart/form-data; boundary=${formData.getBoundary()}`);
    formData.pipe(res);

  } catch (err) {
      console.error(err);
      res.status(500).json({
          message: "Internal Server Error"
      });
  }
  }
}

  // Stream을 Buffer로 변환하는 함수
  function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
  });
  }
