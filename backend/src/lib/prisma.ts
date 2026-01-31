// import "dotenv/config";
// import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaClient } from '../generated/prisma/client'

// const connectionString = `${process.env.DATABASE_URL}`

// const adapter = new PrismaPg({ connectionString })
// const prisma = new PrismaClient({ adapter })

// export { prisma }

// src/lib/prisma.ts
// Import from the generated prisma client
import { PrismaClient } from '../generated/prisma/client';

// Create and export prisma client
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
  log: ['query', 'info', 'warn', 'error'],
});

export { prisma };