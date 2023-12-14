import { Request, Response } from "express";
import multer from 'multer';
import {PrismaClient, TrainImage } from '../../prisma/generated/client'


import { RunpodClient } from "../runpod/client";
import {s3Client, uploadTrainImageSet, uploadZip, generateSignedUrls} from "../s3/client"


require('dotenv').config();

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);
const prisma:PrismaClient = new PrismaClient()

const storage:any = multer.memoryStorage()
const upload: any = multer({ storage: storage})

export default class TrainController {

  async postImageSetAndTrain(req: Request, res: Response) {
    try {
      const userId:string = req.params.user_id;
      const files: Express.Multer.File[] = req.files as Express.Multer.File[];
      const petClass:string = req.body.class;
      console.log("req body", req.body);
      console.log("req file", req.files);

      const zipPath = await uploadZip(files, userId);

      await uploadTrainImageSet(files, userId, petClass, zipPath);

      runpodClient.train(
        `lora_${Date.now()}`,
        petClass,
        zipPath, 
        `pets-mas/users/${userId}/lora`,
         `http://api.pets-mas.com/webhook/train/${userId}`
         )

      res.status(200).send("Train Image uploaded, training in process...");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error processing request");
    }
}

  async getTrainImageSet(req: Request, res: Response) {
    const userId: string = req.params.user_id;
    const imageSet = await prisma.trainImageSet.findFirst({
      where: { userId: userId },
      include: { trainImages: true }
    });
  
    if (!imageSet) {
      return res.send({}); // imageSet이 없는 경우, 빈 객체 반환
    }
  
    const imageUrls = await generateSignedUrls(imageSet.trainImages);
  
    const imageUrlsMap = imageSet.trainImages.reduce<{ [key: number]: string }>((acc, image, index) => {
      acc[image.id] = imageUrls[index];
      return acc;
    }, {});
  
    res.send(imageUrlsMap);
  }

}

