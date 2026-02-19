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
const PORT = parseInt(process.env.PORT || "4000", 10);

app.use(express.json());
app.use(cookieParser())

app.use('/image', fileRoutes)
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

const server = app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});