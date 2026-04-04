import dotenv from "dotenv";
import { S3, S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const bucketRegion = process.env.BUCKET_REGION!;
const bucketAccessKey = process.env.ACCESS_KEY!;
const bucketSecretAccess = process.env.SECRET_ACCESS_KEY!;

const MINIO_REGION = process.env.MINIO_REGION!;
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY!;
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY!;

let s3: S3Client;
let publicS3: S3Client;

if (process.env.NODE_ENV === "docker") {
  console.log("S3 CLIENT");
  s3 = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT!,
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY,
      secretAccessKey: MINIO_SECRET_KEY,
    },
    region: MINIO_REGION,
    forcePathStyle: true,
  });

  publicS3 = new S3Client({
    region: MINIO_REGION,
    endpoint: "http://localhost:9000",
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY,
      secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
  });
} else {
  s3 = new S3Client({
    credentials: {
      accessKeyId: bucketAccessKey,
      secretAccessKey: bucketSecretAccess,
    },
    region: bucketRegion,
  });

  publicS3 = new S3Client({
    credentials: {
      accessKeyId: bucketAccessKey,
      secretAccessKey: bucketSecretAccess,
    },
    region: bucketRegion,
  });
}
export { publicS3 };
export default s3;
