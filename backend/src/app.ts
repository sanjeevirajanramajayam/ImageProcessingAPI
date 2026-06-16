import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { MulterError } from "multer";
import fileRoutes from "./routes/fileRoutes";
import userRoutes from "./routes/userRoutes";
import refreshRoutes from "./routes/refreshRoutes";
import systemRoutes from "./routes/systemRoutes";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { sendError, logError } from "./utils/errorHandler";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan("combined"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:1234",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/image", fileRoutes);
app.use("/", refreshRoutes);
app.use("/", userRoutes);
app.use("/system", systemRoutes);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof MulterError) {
      logError("Multer", err);
      return sendError(res, 400, "UPLOAD_ERROR", err.message);
    }
    return next(err);
  },
);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logError("Global error", err);
    const statusCode = err.statusCode || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = err.message || "An unexpected error occurred";
    return sendError(res, statusCode, code, message);
  },
);

export default app