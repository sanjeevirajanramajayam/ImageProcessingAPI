import s3 from "../config/s3Client";
import { prisma } from "../lib/prisma";
import getRandomImageName from "../utils/utils";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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

  await prisma.images.create({ data: { image_id: ImageId, uploadedUser: { connect: { id: foundUser.id } } } })
  await s3.send(command)

  return res.json(req.file)
}

export const viewFiles = async (req: Request, res: Response) => {
  const foundUser = await prisma.user.findFirst({ where: { email: req.user.email } })

  if (!foundUser) {
    return res.status(404).json({ error: "User not found" })
  }

  const images = await prisma.images.findMany({ where: { user_id: req.user.id } })
  const userImages: (typeof images[number] & { url: string })[] = []

  for (const image of images) {
    const getObjectParams = { Bucket: bucketName, Key: image.image_id }

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

    userImages.push({ ...image, url })
  }

  return res.status(200).json({ userImages })

}

export const transformImage = async (req: Request, res: Response) => {
  try {
    const foundUser = await prisma.user.findFirst({
      where: { email: req.user.email }
    })

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" })
    }

    const { transformations } = req.body

    if (!transformations) {
      return res.status(400).json({ error: "Invalid body" })
    }

    const imageId = Number(req.params.id)

    if (isNaN(imageId)) {
      return res.status(400).json({ error: "Invalid imageId" })
    }

    const requiredImage = await prisma.images.findFirst({
      where: {
        user_id: foundUser.id,
        id: imageId
      }
    })

    if (!requiredImage) {
      return res.status(404).json({ error: "Image not found" })
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: requiredImage.image_id
    })

    const response = await s3.send(command)

    if (!response.Body) {
      return res.status(500).json({ error: "Failed to fetch image" })
    }

    const byteArray = await response.Body.transformToByteArray()
    const imageBuffer = Buffer.from(byteArray)

    const metadata = await sharp(imageBuffer).metadata()
    const imgWidth = metadata.width ?? 0
    const imgHeight = metadata.height ?? 0

    let image = sharp(imageBuffer)

    const {
      resize,
      crop,
      rotate,
      format,
      filters
    } = transformations || {}

    if (crop) {
      const width = Number(crop.width)
      const height = Number(crop.height)
      const x = Number(crop.x)
      const y = Number(crop.y)

      if (
        !isNaN(width) &&
        !isNaN(height) &&
        !isNaN(x) &&
        !isNaN(y) &&
        width > 0 &&
        height > 0 &&
        x >= 0 &&
        y >= 0 &&
        x + width <= imgWidth &&
        y + height <= imgHeight
      ) {
        image = image.extract({
          left: x,
          top: y,
          width,
          height
        })
      } else {
        return res.status(400).json({
          error: "Invalid crop dimensions"
        })
      }
    }

    if (resize) {
      const width = Number(resize.width)
      const height = Number(resize.height)

      if (!isNaN(width) || !isNaN(height)) {
        image = image.resize(
          !isNaN(width) ? width : undefined,
          !isNaN(height) ? height : undefined
        ) 
      }
    }

    if (rotate !== undefined) {
      const angle = Number(rotate)
      if (!isNaN(angle)) {
        image = image.rotate(angle)
      }
    }

    if (filters?.grayscale === true) {
      image = image.grayscale()
    }

    if (filters?.sepia === true) {
      image = image
        .modulate({ saturation: 0.5 })
        .tint({ r: 112, g: 66, b: 20 })
    }

    let outputFormat = metadata.format || "jpeg"

    if (format) {
      const f = format.toLowerCase()

      if (["jpeg", "jpg", "png", "webp"].includes(f)) {
        outputFormat = f === "jpg" ? "jpeg" : f
      }
    }

    if (outputFormat === "jpeg") {
      image = image.jpeg({ quality: 80 })
    } else if (outputFormat === "png") {
      image = image.png()
    } else if (outputFormat === "webp") {
      image = image.webp()
    }

    const finalBuffer = await image.toBuffer()

    res.set("Content-Type", `image/${outputFormat}`)
    return res.send(finalBuffer)

  } catch (err) {
    console.error("Transform error:", err)
    return res.status(500).json({
      error: "Image processing failed"
    })
  }
}