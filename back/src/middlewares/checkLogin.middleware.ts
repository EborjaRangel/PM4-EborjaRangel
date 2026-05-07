import { NextFunction, Request, Response } from "express";
import { ClientError } from "../utils/errors";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/envs";

function extractBearer(raw: string | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.toLowerCase().startsWith("bearer "))
    return trimmed.slice(7).trim();
  return trimmed;
}

const checkLogin = async (req: Request, res: Response, next: NextFunction) => {
  const raw = extractBearer(req.headers.authorization);
  if (!raw) {
    return next(new ClientError("Token is required"));
  }

  try {
    const decoded = jwt.verify(raw, JWT_SECRET) as { userId: number };
    res.locals.authUserId = decoded.userId;
  } catch (error) {
    next(new ClientError("Invalid token"));
  }
  console.log("Token Check OK");

  next();
};

export default checkLogin;
