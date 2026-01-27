import express from "express";
import dotenv from "dotenv";
import { prisma } from './lib/prisma'

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());


// app.get("/", async (req, res) => {
//   return res.json({ message: "hello" });
// });

app.post("/register", async (req, res) => {
  const { username, email } = req.body;
  const user = await prisma.user.create({
    data: {
      name: username,
      email: email,
    },
  });
  
  return res.status(201).json(user);
})

app.get("/view-users", async (req, res) => {
  const users = await prisma.user.findMany();
  
  return res.status(200).json(users);
})

app.listen(4000, () => {
  console.log(`Server running on ${PORT}`);
});