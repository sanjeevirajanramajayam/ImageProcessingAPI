import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { MulterError } from 'multer';
import fileRoutes from './routes/fileRoutes'
import userRoutes from './routes/userRoutes'
import refreshRoutes from './routes/refreshRoutes'
import verifyJWT from "./middleware/verifyJWT";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser())

app.use('/image', verifyJWT, fileRoutes)
app.use('/', refreshRoutes)
app.use('/', userRoutes)


app.use(async (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof MulterError) {
    return res.status(400).json({ error: err })
  }
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Body parse error:", err.message)
  res.status(400).json({ error: "Invalid JSON body" })
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});