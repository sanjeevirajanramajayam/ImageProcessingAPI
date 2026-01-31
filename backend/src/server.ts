

// import express from "express";
// import dotenv from "dotenv";
// import { prisma } from './lib/prisma'
// import multer from 'multer';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT;

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now().toString() + file.originalname)
//   }
// })

// const upload = multer({storage})

// app.use(express.json());

// app.post('/upload', upload.array('file'), (req, res) => {
//   console.log(req.body)
//   return res.json(req.files)
// })

// app.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;
//   const user = await prisma.user.create({
//     data: {
//       name: username,
//       email: email,
//       password: password,
//     },
//   });

//   return res.status(201).json(user);
// })

// app.get("/view-users", async (req, res) => {
//   const users = await prisma.user.findMany();

//   return res.status(200).json(users);
// })

// app.post("/login", async (req, res) => {
//   try {
//     console.log("LOGIN HIT");

//     const { email, password } = req.body;

//     const user = await prisma.user.findFirst({
//       where: { email, password: password },
//     });

//     if (!user) {
//       return res.status(404).json({ "message": "User not found!" });
//     }
//     else {
//       return res.status(200).json(user);
//     }

//   } catch (error) {
//     console.error("PRISMA ERROR:", error);
//     return res.status(500).json({ message: "Prisma error" });
//   }
// });


// app.listen(PORT, () => {
//   console.log(`Server running on ${PORT}`);
// });


// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/prismaClient.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";
import multer from "multer";

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiter
app.use(apiRateLimiter);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB" });
    }
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads available at http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();