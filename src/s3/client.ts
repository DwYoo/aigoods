import {ListBucketsCommand, S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
require('dotenv').config(); // Load environment variables from .env file

// When no region or credentials are provided, the SDK will use the
// region and credentials from the local AWS config.

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

export {s3Client}


