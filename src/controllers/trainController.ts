import { Request, Response } from "express";
import multer from 'multer';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import {ListBucketsCommand, GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {s3Client} from "../s3/client"


require('dotenv').config();

const storage:any = multer.memoryStorage()
const upload: any = multer({ storage: storage})

export default class TrainController {

  async postImageSetAndTrain(req: Request, res: Response) {
    try {
      const user_id:string = req.params.user_id;
      const file: Express.Multer.File | undefined = req.file;
      const caption = req.body.caption
      console.log("req body", req.body);
      console.log("req.file", req.file);
      const fileName = ""
      const uploadParams = {
        Bucket: String(process.env.S3_BUCKET_NAME),
        Body: req.file?.buffer,
        Key: fileName,
        ContentType: file?.mimetype
      }
    
      // Send the upload to S3
      await s3Client.send(new PutObjectCommand(uploadParams));
    
      // Save the image name to the database. Any other req.body data can be saved here too but we don't need any other image data.
      const post = await prisma.posts.create({
        data: {
          imageName,
          caption,
        }
      })
    
      res.send(post)
    })
      res.status(200).json({
        message: "findAll OK"
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!"
      });
    }
  

  async getTrainImageSet(req: Request, res: Response) {
    const posts = await prisma.posts.findMany({ orderBy: [{ created: 'desc' }] }) // Get all posts from the database

    for (let post of posts) { // For each post, generate a signed URL and save it to the post object
      post.imageUrl = await getSignedUrl(
        s3Client,
        GetObjectCommand({
          Bucket: String(process.env.S3_BUCKET_NAME),
          Key: imageName
        }),
        { expiresIn: 60 }// 60 seconds
      )
    }
  
    res.send(posts)
  }

}