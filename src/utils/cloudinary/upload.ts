import fs from 'fs';
import { Readable } from 'stream';
import cloudinary from './config'; // Import the Cloudinary configuration
import { UploadApiResponse } from "cloudinary";


async function uploadToCloudinary(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      let cloudStream = cloudinary.uploader.upload_stream((error, result:UploadApiResponse) => {
        if (error) {
          reject(error);
          return '';
        }
        resolve(result.url);
      });
  
      stream.pipe(cloudStream);
    });
  }

  async function uploadLocalImage(filePath: string): Promise<string> {
    const stream = fs.createReadStream(filePath);
    return uploadToCloudinary(stream);
  }

  export {uploadToCloudinary, uploadLocalImage}