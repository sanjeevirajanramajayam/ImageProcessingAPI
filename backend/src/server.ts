import express from "express";
import dotenv from "dotenv";
import { prisma } from './lib/prisma'
import multer, { MulterError } from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now().toString() + file.originalname)
  }
})

const upload = multer({ storage })

app.use(express.json());



app.post('/upload', upload.array('file', 2), (req, res) => {
  // console.log(req.body)
  return res.json(req.files)
})

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await prisma.user.create({
    data: {
      name: username,
      email: email,
      password: password,
    },
  });

  return res.status(201).json(user);
})

app.get("/view-users", async (req, res) => {
  const users = await prisma.user.findMany();

  return res.status(200).json(users);
})

app.post("/login", async (req, res) => {
  try {
    console.log("LOGIN HIT");

    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email, password: password },
    });

    if (!user) {
      return res.status(404).json({ "message": "User not found!" });
    }
    else {
      return res.status(200).json(user);
    }

  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return res.status(500).json({ message: "Prisma error" });
  }
});

app.use(async (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof MulterError) {
    return res.status(400).json({ error: err })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});