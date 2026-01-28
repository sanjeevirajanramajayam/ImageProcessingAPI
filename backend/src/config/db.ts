import {prisma} from '../lib/prismaClient';;
export const connectDB = async () =>{
    try{
        await prisma.$connect();
        console.log("DB connected successfully");
    }
    catch(err){
        console.error("DB connection failed", err);
        process.exit(1);
    }
}