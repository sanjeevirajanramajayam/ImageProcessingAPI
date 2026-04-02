import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

// const connectionString = `${process.env.DATABASE_URL}`
console.log(process.env.DB_HOST)
const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    allowPublicKeyRetrieval: true,
    ssl: false
})
const prisma = new PrismaClient({ adapter })

export { prisma }