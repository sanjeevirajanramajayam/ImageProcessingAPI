// src/lib/prismaClient.ts
import { prisma } from './prisma.js';

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ DB connected successfully");
  } catch (err) {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  }
};