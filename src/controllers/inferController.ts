import { Request, Response } from "express";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";

import { RunpodClient } from "../runpod/client";
import {PrismaClient, User } from '../../prisma/generated/client'
import {s3Client,} from "../utils/s3/client"
import { Readable } from 'stream';
import {uploadToCloudinary} from '../utils/cloudinary/upload'


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

      console.log(userId)
      console.log(user)

      

      if (user) {
        playCount = user.playCount;
        if (user.trainImageSet) {
          petName = user.trainImageSet.petName
        } else {
          console.log(`No train image set for user ${userId}`)
          res.status(200).json({
            message: ''
          })
          return;
        }
      } 
       else {
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
              id: user.trainImageSet?.id
            }
          }
        },
        orderBy: {
          createdAt: 'desc' // 최신순으로 정렬
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
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          playCount: {
            increment: 1,
          },
        }
      })
    
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
      }
    });
    let playCount: number = 0; 
    let petName: string = "";

    if (user) {
      playCount = user.playCount;
      if (user.trainImageSet) {
        petName = user.trainImageSet.petName
      } else {
        console.log(`No train image set for user ${userId}`)
        res.status(200).json({
          message: ''
        })
        return;
      }
    } else {
      console.log("User not found");
      res.status(404).json({
        message: "User not found"
      })
      return;
    }

    const trainImageSet = await prisma.trainImageSet.findFirst({
      where: {
        userId: userId
      },
      include: {
        lora:true
      }
    })

    const lora = trainImageSet?.lora!
    
    const genImages = await prisma.genImage.findMany({
      where: {
        loraId: lora.id
      },
      orderBy: {
        createdAt: 'desc' // 최신순으로 정렬
      },
      take: IMAGE_PER_COUNT * playCount
    });

    if (genImages.length < 3) {
      res.status(200).json({
        message: ''
      })
      return;
    }

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
}
