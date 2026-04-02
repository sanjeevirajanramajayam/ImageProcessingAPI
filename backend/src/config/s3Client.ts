import dotenv from 'dotenv'
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config()

const bucketRegion = process.env.BUCKET_REGION!
const bucketAccessKey = process.env.ACCESS_KEY!
const bucketSecretAccess = process.env.SECRET_ACCESS_KEY!

const s3 = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT!,
    credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY!, secretAccessKey: process.env.MINIO_SECRET_KEY! },
    region: "us-east-1",
    forcePathStyle: true
})

export default s3;