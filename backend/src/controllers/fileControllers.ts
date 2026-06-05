import s3, { publicS3 } from "../config/s3Client";
import { prisma } from "../lib/prisma";
import {
  getRandomImageName,
  applyTransformations,
  generateHash,
} from "../utils/utils";
import { sendError, logError } from "../utils/errorHandler";
import {
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { redisClient } from "../config/redisClient";

const bucketName = process.env.BUCKET_NAME!;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const uploadFiles = async (req: Request, res: Response) => {
  if (!req.files) {
    return sendError(res, 400, "NO_FILES", "No files were provided");
  }

  const foundUser = await prisma.user.findFirst({
    where: { email: req.user!.email },
  });

  if (!foundUser) {
    return sendError(res, 404, "USER_NOT_FOUND", "User not found");
  }

  await redisClient.incr(`userImagesVersion:${foundUser.id}`);

  const uploadedFiles = await Promise.all(
    (req.files as Express.Multer.File[]).map(async (file: Express.Multer.File) => {
      const ImageId = `image/${getRandomImageName()}`;

      const params = {
        Bucket: bucketName,
        Key: ImageId,
        Body: file?.buffer,
      };

      const command = new PutObjectCommand(params);

      const image = await prisma.images.create({
        data: { image_id: ImageId, user_id: foundUser.id },
      });

      await s3.send(command);
      return image;
    }),
  );

  return res.status(200).json({
    uploadedFiles,
    message: `Successfully uploaded ${uploadedFiles.length} image(s)`,
  });
};

export const viewFiles = async (req: Request, res: Response) => {
  const foundUser = await prisma.user.findFirst({
    where: { email: req.user!.email },
  });

  if (!foundUser) {
    return sendError(res, 404, "USER_NOT_FOUND", "User not found");
  }

  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const limit = Math.min(
    parsePositiveInt(req.query.limit, DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const offset = (page - 1) * limit;
  const cacheVersion = Number(
    (await redisClient.get(`userImagesVersion:${foundUser.id}`)) ?? 0,
  );
  const cacheKey = `userImages:${foundUser.id}:v${cacheVersion}:page:${page}:limit:${limit}`;

  const cachedUserImages = await redisClient.get(cacheKey);
  if (cachedUserImages) {
    return res.status(200).json(JSON.parse(cachedUserImages));
  }

  const [totalImages, images] = await Promise.all([
    prisma.images.count({ where: { user_id: foundUser.id } }),
    prisma.images.findMany({
      where: { user_id: foundUser.id },
      orderBy: { id: "desc" },
      skip: offset,
      take: limit,
    }),
  ]);

  const userImages = await Promise.all(
    images.map(async (image) => {
      const getObjectParams = {
        Bucket: bucketName,
        Key: image.image_id,
        ResponseContentDisposition: "inline",
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(publicS3, command, { expiresIn: 3600 });

      return { ...image, url };
    }),
  );

  const responseBody = {
    userImages,
    pagination: {
      page,
      limit,
      totalImages,
      totalPages: Math.max(1, Math.ceil(totalImages / limit)),
      hasNextPage: page * limit < totalImages,
      hasPreviousPage: page > 1,
    },
  };

  await redisClient.set(cacheKey, JSON.stringify(responseBody), {
    EX: 900,
  });

  return res.status(200).json(responseBody);
};

export const viewFile = async (req: Request, res: Response) => {
  let image_id = Number(req.params.id);

  if (isNaN(image_id)) {
    return sendError(res, 400, "INVALID_IMAGE_ID", "Invalid image ID format");
  }
  const foundUser = await prisma.user.findFirst({
    where: { email: req.user!.email },
  });

  if (!foundUser) {
    return sendError(res, 404, "USER_NOT_FOUND", "User not found");
  }

  const cachedImage = await redisClient.get(image_id.toString());

  if (cachedImage) {
    return res.status(200).json(JSON.parse(cachedImage));
  }

  const image = await prisma.images.findFirst({
    where: { id: image_id, user_id: req.user!.id },
  });

  if (image) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: image.image_id,
      ResponseContentDisposition: "inline",
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(publicS3, command, { expiresIn: 3600 });

    await redisClient.set(
      image_id.toString(),
      JSON.stringify({ image_id: image.image_id, url: url }),
    );

    return res.status(200).json({ image_id: image.image_id, url: url });
  } else {
    return sendError(res, 404, "IMAGE_NOT_FOUND", "Image not found");
  }
};

export const transformImage = async (req: Request, res: Response) => {
  try {
    const {
      w,
      h,
      crop_w,
      crop_h,
      crop_x,
      crop_y,
      rotate,
      format,
      gray,
      sepia,
      remove_bg,
    } = req.query;

    const transformations = {
      resize: w || h ? { width: w, height: h } : undefined,
      crop:
        crop_w && crop_h
          ? {
              width: crop_w,
              height: crop_h,
              x: crop_x || 0,
              y: crop_y || 0,
            }
          : undefined,
      rotate: rotate,
      format: format,
      filters: {
        grayscale: gray === "true",
        sepia: sepia === "true",
      },
      remove_bg: remove_bg === "true",
    };

    if (!transformations) {
      return res.status(400).json({ error: "Invalid query" });
    }

    const imageId = Number(req.params.id);

    if (isNaN(imageId)) {
      return res.status(400).json({ error: "Invalid imageId" });
    }

    const requiredImage = await prisma.images.findFirst({
      where: {
        id: imageId,
      },
    });

    if (!requiredImage) {
      return res.status(404).json({ error: "Image not found" });
    }

    const cacheKey = `image/${requiredImage.image_id.slice(6)}/${generateHash(requiredImage.image_id, transformations)}`;
    const getImageFromCache = await redisClient.get(cacheKey);
    
    if (getImageFromCache != null) {
      return res.redirect(getImageFromCache);
    }

    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: cacheKey,
      });
      await s3.send(headCommand);
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: cacheKey,
        ResponseContentDisposition: "inline",
      });
      const url = await getSignedUrl(publicS3, command, { expiresIn: 3600 });
      
      await redisClient.set(cacheKey, url, { EX: 3600 });
      return res.redirect(url);
    } catch (err) {
      // Continue
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: requiredImage.image_id,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      return res.status(500).json({ error: "Failed to fetch image" });
    }

    const byteArray = await response.Body.transformToByteArray();
    const imageBuffer = Buffer.from(byteArray);

    const { finalBuffer, outputFormat } = await applyTransformations(
      imageBuffer,
      transformations,
    );

    const putCommandParams = {
      Bucket: bucketName,
      Key: cacheKey,
      Body: finalBuffer,
      ContentType: `image/${outputFormat}`,
    };

    const putCommand = new PutObjectCommand(putCommandParams);
    await s3.send(putCommand);

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: cacheKey,
    });
    const url = await getSignedUrl(publicS3, getCommand, { expiresIn: 3600 });
    
    await redisClient.set(cacheKey, url, { EX: 3600 });

    return res.redirect(url);
  } catch (err) {
    console.error("Transform error:", err);
    return res.status(500).json({
      error: "Image processing failed",
    });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const imageId = Number(req.params.id);

    if (isNaN(imageId)) {
      return res.status(400).json({ error: "Invalid imageId" });
    }

    const foundUser = await prisma.user.findFirst({
      where: { email: req.user!.email },
    });

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const image = await prisma.images.findFirst({
      where: { id: imageId, user_id: foundUser.id },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    try {
      const deleteParams = {
        Bucket: bucketName,
        Key: image.image_id,
      };
      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await s3.send(deleteCommand);
    } catch (s3Error) {
      console.error("S3 deletion error:", s3Error);
    }

    await prisma.imageVersion.deleteMany({
      where: { orig_image_id: imageId },
    });

    await prisma.images.delete({
      where: { id: imageId },
    });

    await redisClient.incr(`userImagesVersion:${foundUser.id}`);

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Failed to delete image" });
  }
};
