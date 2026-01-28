import { Request,Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {prisma} from "../lib/prisma";

export const register=async(req:Request,res:Response)=>{
    try{
        const {name,email,password}=req.body;
        const hashedPassword = await bcrypt.hash(password,10);
        const user= await prisma.user.create({
            data:{
                name,email,password:hashedPassword,
            }
        });
        return res.status(201).json(user);
    }
    catch(error){
         return res.status(500).json({message:"registration failed"});
    }
}

export const login=async(req:Request,res:Response)=>{
    try{
        const {email,password} = req.body;
        const user=await prisma.user.findUnique({where :{email}})
        if(!user){
            return res.status(404).json({message: "user not found"});
        } 
        const isMatch=await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({ message:"Invalid Credentials"});
        }

        const token=jwt.sign(
            {userId:user.id},
            process.env.JWT_SECRET!,
            {expiresIn:"1hr"}
        )
       }
       catch(error){
        return res.status(500).json({message:"Login failed"})
       }
}
