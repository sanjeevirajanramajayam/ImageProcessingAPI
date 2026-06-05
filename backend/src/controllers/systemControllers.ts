import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getHealthStatus = async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return res.status(503).json({
      status: "unhealthy",
      error: "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        code: "NO_AUTH",
        message: "Authentication required",
      });
    }

    const foundUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true },
    });

    if (!foundUser) {
      return res.status(404).json({
        error: "NOT_FOUND",
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    const totalImages = await prisma.images.count({
      where: { user_id: req.user.id },
    });

    const totalVersions = await prisma.imageVersion.count({
      where: { originalImage: { user_id: req.user.id } },
    });

    return res.status(200).json({
      user: foundUser,
      stats: {
        totalImages,
        totalTransformations: totalVersions,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      code: "STATS_ERROR",
      message: "Failed to retrieve stats",
    });
  }
};
