import s3 from "../config/s3Client";
import getRandomImageName from "../utils/utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response } from "express";

const bucketName = process.env.BUCKET_NAME

const uploadFile = async (req: Request, res: Response) => {
  const params = {
    Bucket: bucketName,
    Key: getRandomImageName(),
    Body: req.file?.buffer,
  }

  const command = new PutObjectCommand(params)
  await s3.send(command)

  return res.json(req.file)
}

export default uploadFile