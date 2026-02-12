import express from "express";
import dotenv from "dotenv";
import { MulterError } from 'multer';
import uploadRoutes from './routes/fileRoutes'
import userRoutes from './routes/fileRoutes'

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use('/image', uploadRoutes)
app.use('/', userRoutes)


app.use(async (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof MulterError) {
    return res.status(400).json({ error: err })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});