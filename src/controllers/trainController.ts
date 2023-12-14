import { Request, Response } from "express";
import multer from 'multer';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PrismaClient, TrainImage } from '../../prisma/generated/client'
import Archiver from 'archiver';
import stream from 'stream';

import { RunpodClient } from "../runpod/client";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3"; 
import {s3Client} from "../s3/client"


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
      const caption = req.body.caption;
      console.log("req body", req.body);
      console.log("req.file", req.file);

      const zipFileName = `${Date.now()}_images.zip`;
      const zipPath = `${userId}/train/${zipFileName}`;

      const zipStream = new stream.PassThrough();
      const archive = Archiver('zip', { zlib: { level: 9 } });
      archive.pipe(zipStream);
  
      for (const file of files) {
        archive.append(file.buffer, { name: file.originalname });
      }
      await archive.finalize();

      const trainImageSet = await prisma.trainImageSet.create({
        data: {
          userId: userId,
          folderPath: `pets-mas/users/${userId}/train`, // 필요한 경우 적절한 폴더 경로 설정
          zipPath: zipPath     // 필요한 경우 적절한 ZIP 파일 경로 설정
        }
      });
      
      for (const file of files) {
        const fileName = `${Date.now()}_${file.originalname}`;

        const uploadParams = {
          Bucket: String(process.env.S3_BUCKET_NAME),
          Body: file.buffer,
          Key: `pets-mas/users/${userId}/train/${fileName}`,
          ContentType: file.mimetype
        };

        // S3에 파일 업로드
        await s3Client.send(new PutObjectCommand(uploadParams));

        // TrainImage 생성
        await prisma.trainImage.create({
          data: {
            setId: trainImageSet.id,
            filePath: `pets-mas/users/${userId}/train/${fileName}`
          }
        });
      }

      runpodClient.train(
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
  
    const imageUrls = await Promise.all(
      imageSet.trainImages.map(image =>
        getSignedUrl(s3Client, new GetObjectCommand({
          Bucket: String(process.env.S3_BUCKET_NAME),
          Key: image.filePath
        }), { expiresIn: 180 })
      )
    );
  
    const imageUrlsMap = imageSet.trainImages.reduce<{ [key: number]: string }>((acc, image, index) => {
      acc[image.id] = imageUrls[index];
      return acc;
    }, {});
  
    res.send(imageUrlsMap);
  }

}

