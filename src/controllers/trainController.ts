import { Request, Response } from "express";
import {multer} from 'multer';

const storage:any = multer.memoryStorage()
const upload: any = multer({ storage: storage})

// upload.array('image', 9)

export default class TrainController {

  async postImageSetAndTrain(req: Request, res: Response) {
    try {
      const user_id:string = req.params.user_id;
      const file = req.file 
      const caption = req.body.caption
      console.log("req body", req.body);
      console.log("req.file", req.file);
    
      const fileBuffer = await sharp(file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer()
    
      // Configure the upload details to send to S3
      const fileName = generateFileName()
      const uploadParams = {
        Bucket: bucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: file.mimetype
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
    try {
      const user_id:string = req.params.user_id;
      res.status(200).json({
        message: "findOne OK",
        reqParamId: req.params.id
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!"
      });
    }
  }

}