import { Request, Response, NextFunction } from "express";

export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        code: "MISSING_FIELDS",
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }
    next();
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateImageId = (id: unknown): boolean => {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0;
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain lowercase letters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain uppercase letters";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain numbers";
  }
  return null;
};

export const sanitizeString = (str: string): string => {
  return str.trim().slice(0, 255);
};
