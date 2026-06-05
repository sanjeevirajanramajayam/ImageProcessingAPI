import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validateEmail, validatePassword, sanitizeString } from "../utils/validation";
import { sendError, logError } from "../utils/errorHandler";

const accessSecret = process.env.JWT_ACCESS_TOKEN!;
const refreshSecret = process.env.JWT_REFRESH_TOKEN!;

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return sendError(res, 400, "VALIDATION_ERROR", "Username, email, and password are required");
  }

  const sanitizedUsername = sanitizeString(username);
  if (sanitizedUsername.length < 2) {
    return sendError(res, 400, "VALIDATION_ERROR", "Username must be at least 2 characters");
  }

  if (!validateEmail(email)) {
    return sendError(res, 400, "INVALID_EMAIL", "Please provide a valid email address");
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return sendError(res, 400, "WEAK_PASSWORD", passwordError);
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 409, "DUPLICATE_EMAIL", "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: sanitizedUsername,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Registration successful",
    });
  } catch (error: any) {
    logError("Registration", error);
    return sendError(res, 500, "REGISTRATION_FAILED", "Failed to create account");
  }
};

export const viewUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  return res.status(200).json(users);
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "VALIDATION_ERROR", "Email and password are required");
    }

    if (!validateEmail(email)) {
      return sendError(res, 400, "INVALID_EMAIL", "Please provide a valid email address");
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return sendError(res, 401, "AUTH_FAILED", "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, "AUTH_FAILED", "Invalid email or password");
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, accessSecret, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user.id, email }, refreshSecret, {
      expiresIn: "1d",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
      message: "Login successful",
    });
  } catch (error) {
    logError("Login", error);
    return sendError(res, 500, "LOGIN_ERROR", "Login failed");
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies.jwt) {
    return res.sendStatus(204);
  }

  const refreshToken = req.cookies.jwt;

  const foundUser = await prisma.user.findFirst({ where: { refreshToken } });

  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.sendStatus(204);
  }

  await prisma.user.update({
    where: { email: foundUser.email },
    data: { refreshToken: null },
  });
  res.clearCookie("jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

  return res.sendStatus(204);
};
