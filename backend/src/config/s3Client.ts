import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const s3Endpoint = process.env.S3_ENDPOINT;
const publicS3Endpoint = process.env.PUBLIC_S3_ENDPOINT || s3Endpoint;

let s3: S3Client;
let publicS3: S3Client;

if (s3Endpoint) {
  const minioRegion = process.env.MINIO_REGION || "us-east-1";
  const minioAccessKey = process.env.MINIO_ACCESS_KEY || "admin";
  const minioSecretKey = process.env.MINIO_SECRET_KEY || "password";

  s3 = new S3Client({
    endpoint: s3Endpoint,
    credentials: {
      accessKeyId: minioAccessKey,
      secretAccessKey: minioSecretKey,
    },
    region: minioRegion,
    forcePathStyle: true,
  });

  publicS3 = new S3Client({
    endpoint: publicS3Endpoint,
    credentials: {
      accessKeyId: minioAccessKey,
      secretAccessKey: minioSecretKey,
    },
    region: minioRegion,
    forcePathStyle: true,
  });
} else {
  const bucketRegion = process.env.BUCKET_REGION!;
  const bucketAccessKey = process.env.ACCESS_KEY!;
  const bucketSecretAccess = process.env.SECRET_ACCESS_KEY!;

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

