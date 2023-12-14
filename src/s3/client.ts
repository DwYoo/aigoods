import {S3Client, PutObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import Archiver from 'archiver';
import stream from 'stream';

import {PrismaClient, TrainImage } from '../../prisma/generated/client'

require('dotenv').config(); // Load environment variables from .env file

// When no region or credentials are provided, the SDK will use the
// region and credentials from the local AWS config.
const prisma:PrismaClient = new PrismaClient()

const bucketRegion = String(process.env.S3_REGION)
const accessId = String(process.env.S3_PUBLIC_KEY)
const secretKey = String(process.env.S3_SECRET_KEY)
const bucketName = "pets-mas"

const s3Client = new S3Client({
    credentials: {
        accessKeyId: accessId,
        secretAccessKey: secretKey,
    },
    region: bucketRegion,
    }
);

async function uploadTrainImageSet(files: Express.Multer.File[], userId: string, petClass:string, zipPath:string): Promise<void> {

    let trainImageSet = await prisma.trainImageSet.findFirst({
        where: {
          userId: userId
        }
      });

      if (!trainImageSet) {
        trainImageSet = await prisma.trainImageSet.create({
          data: {
            userId: userId,
            folderPath: `pets-mas/users/${userId}/train`,
            petClass: petClass,
            zipPath: zipPath // 초기값 설정
          }
        });
      } else {
        await prisma.trainImageSet.update({
          where: {
            id: trainImageSet.id
          },
          data: {
            folderPath: `pets-mas/users/${userId}/train`,
            zipPath: '' // 업데이트할 값 설정
          }
        });
      }

    for (const file of files) {
      const fileName = `${Date.now()}_${file.originalname}`;
      const filePath = `pets-mas/users/${userId}/train/${fileName}`;

      const uploadParams = {
        Bucket: bucketName,
        Body: file.buffer,
        Key: filePath,
        ContentType: file.mimetype
      };

      // S3에 파일 업로드
      await s3Client.send(new PutObjectCommand(uploadParams));

      // TrainImage 생성
      await prisma.trainImage.create({
        data: {
          setId: trainImageSet.id,
          filePath: filePath
        }
      });
    }
  }

  async function uploadZip(files: Express.Multer.File[], userId: string): Promise<string> {
    const zipFileName = `${Date.now()}_images.zip`;
    const zipPath = `pets-mas/users/${userId}/train/${zipFileName}`;

    const zipStream = new stream.PassThrough();
    const archive = Archiver('zip', { zlib: { level: 9 } });
    archive.pipe(zipStream);

    for (const file of files) {
      archive.append(file.buffer, { name: file.originalname });
    }
    await archive.finalize();

    // S3에 ZIP 파일 업로드
    const uploadParams = {
      Bucket: bucketName,
      Body: zipStream,
      Key: zipPath
    };
    await s3Client.send(new PutObjectCommand(uploadParams));

    return zipPath;
  }

async function generateSignedUrls(trainImages: TrainImage[]) {
return await Promise.all(
    trainImages.map(image =>
    getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: String(process.env.S3_BUCKET_NAME),
        Key: image.filePath
    }), { expiresIn: 180 })
    )
);
}

export {s3Client, uploadTrainImageSet, uploadZip, generateSignedUrls}


