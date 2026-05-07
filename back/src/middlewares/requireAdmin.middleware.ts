import { NextFunction, Request, Response } from "express";
import { ClientError } from "../utils/errors";
import { UserRepository } from "../repositories/user.repository";
import { Role } from "../entities/User";

/** Debe ejecutarse después de `checkLogin` (authUserId en res.locals). */
const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = res.locals.authUserId;
    if (!userId) return next(new ClientError("Forbidden", 403));

    const user = await UserRepository.findOne({
      where: { id: userId },
      select: ["id", "role"],
    });

    if (!user || user.role !== Role.ADMIN) {
      return next(new ClientError("Forbidden", 403));
    }
    next();
  } catch {
    next(new ClientError("Forbidden", 403));
  }
};

export default requireAdmin;
