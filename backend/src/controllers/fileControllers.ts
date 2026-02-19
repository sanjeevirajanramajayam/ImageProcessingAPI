import s3 from "../config/s3Client";
import { prisma } from "../lib/prisma";
import { getRandomImageName, applyTransformations, generateHash } from "../utils/utils";
import { PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from 'sharp'

const bucketName = process.env.BUCKET_NAME!

export const uploadFile = async (req: Request, res: Response) => {
  const ImageId = getRandomImageName()
  const params = {
    Bucket: bucketName,
    Key: ImageId,
    Body: req.file?.buffer,
  }

  const command = new PutObjectCommand(params)

  const foundUser = await prisma.user.findFirst({ where: { email: req.user.email } })
  if (!foundUser) {
    return res.status(404).json({ error: "User not found" })
  }

  const image = await prisma.images.create({ data: { image_id: ImageId, user_id: foundUser.id } })
  await s3.send(command)

  return res.json({ image })
}

export const viewFiles = async (req: Request, res: Response) => {
  const foundUser = await prisma.user.findFirst({ where: { email: req.user.email } })

  if (!foundUser) {
    return res.status(404).json({ error: "User not found" })
  }

  const images = await prisma.images.findMany({ where: { user_id: foundUser.id } })
  const userImages: (typeof images[number] & { url: string })[] = []

  for (const image of images) {
    const getObjectParams = { Bucket: bucketName, Key: image.image_id, ResponseContentDisposition: "inline" }

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

    userImages.push({ ...image, url })
  }

  return res.status(200).json({ userImages })

}

export const transformImage = async (req: Request, res: Response) => {
  try {

    // const foundUser = await prisma.user.findFirst({
    //   where: { email: req.user.email }
    // })

    // if (!foundUser) {
    //   return res.status(404).json({ error: "User not found" })
    // }

    const {
      w, h,
      crop_w, crop_h, crop_x, crop_y,
      rotate, format,
      gray, sepia, remove_bg
    } = req.query;

    const transformations = {
      resize: (w || h) ? { width: w, height: h } : undefined,
      crop: (crop_w && crop_h) ? {
        width: crop_w, height: crop_h,
        x: crop_x || 0, y: crop_y || 0
      } : undefined,
      rotate: rotate,
      format: format,
      filters: {
        grayscale: gray === 'true',
        sepia: sepia === 'true'
      },
      remove_bg: remove_bg === 'true'
    };

    console.log(transformations)

    if (!transformations) {
      return res.status(400).json({ error: "Invalid query" })
    }

    const imageId = Number(req.params.id)

    if (isNaN(imageId)) {
      return res.status(400).json({ error: "Invalid imageId" })
    }

    let requiredImage = await prisma.images.findFirst({
      where: {
        id: imageId
      }
    })

    if (!requiredImage) {
      return res.status(404).json({ error: "Image not found" })
    }

    let finalVersion = requiredImage

    const cacheKey = generateHash(finalVersion?.image_id!, transformations)

    try {
      const headCommand = new HeadObjectCommand({ Bucket: bucketName, Key: cacheKey })
      await s3.send(headCommand)
      const command = new GetObjectCommand({ Bucket: bucketName, Key: cacheKey, ResponseContentDisposition: "inline" });
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
      console.error({ message: "CACHE HIT SUCCESSFUL" })
      return res.redirect(url)
    }
    catch (err) {
      console.error({ message: "CACHE HIT FAILED", error: err })
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: finalVersion.image_id
    })

    const response = await s3.send(command)

    if (!response.Body) {
      return res.status(500).json({ error: "Failed to fetch image" })
    }

    const byteArray = await response.Body.transformToByteArray()
    const imageBuffer = Buffer.from(byteArray)

    let metadata = await sharp(imageBuffer).metadata()
    let outputFormat = metadata.format || "jpeg"

    const finalBuffer = await applyTransformations(imageBuffer, transformations)

    const putCommandParams = {
      Bucket: bucketName,
      Key: cacheKey,
      Body: finalBuffer,
      ContentType: `image/${outputFormat}`
    }

    const putCommand = new PutObjectCommand(putCommandParams)

    await s3.send(putCommand) // await ensures this runs now and not in the background while others is running.

    const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: cacheKey });
    const url = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

    return res.redirect(url);

  } catch (err) {
    console.error("Transform error:", err)
    return res.status(500).json({
      error: "Image processing failed"
    })
  }
}
