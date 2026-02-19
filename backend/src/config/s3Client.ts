import dotenv from 'dotenv'
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config()

const bucketRegion = process.env.BUCKET_REGION!
const bucketAccessKey = process.env.ACCESS_KEY!
const bucketSecretAccess = process.env.SECRET_ACCESS_KEY!

const s3 = new S3Client({
    credentials: { accessKeyId: bucketAccessKey, secretAccessKey: bucketSecretAccess },
    region: bucketRegion
})

export default s3;