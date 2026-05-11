import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import { toPublicUserJson } from "../helpers/serializeUser";
import { ClientError } from "../utils/errors";
import {
  getUserByIdService,
  listPublicUsersService,
  loginUserService,
  registerUserService,
  updateUserContactService,
  updateUserPasswordService,
} from "../services/user.service";
import { notifyNewRegistrationWhatsApp } from "../helpers/whatsappRegistrationNotify";

export const registerUser = catchedController(
  async (req: Request, res: Response) => {
    const { email, password, name, address, phone } = req.body;
    const newUser = await registerUserService({
      email,
      password,
      name,
      address,
      phone,
    });
    void notifyNewRegistrationWhatsApp({
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      registeredAt: new Date(),
    });
    res.status(201).send(toPublicUserJson(newUser));
  },
);

export const login = catchedController(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const bundle = await loginUserService({ email, password });
  res.status(200).send({
    login: true,
    user: toPublicUserJson(bundle.user),
    token: bundle.token,
  });
});

export const getMe = catchedController(async (req: Request, res: Response) => {
  const userId = res.locals.authUserId as number;
  const user = await getUserByIdService(userId);
  if (!user) throw new ClientError("User not found", 404);
  res.status(200).send(toPublicUserJson(user));
});

export const patchMe = catchedController(async (req: Request, res: Response) => {
  const userId = res.locals.authUserId as number;
  const { address, phone, currentPassword, newPassword } = req.body;

  const wantsPassword =
    typeof newPassword === "string" &&
    newPassword.trim().length > 0;
  const wantsContact =
    typeof address === "string" || typeof phone === "string";

  if (!wantsPassword && !wantsContact) {
    throw new ClientError("No changes provided");
  }

  if (wantsPassword) {
    if (
      typeof currentPassword !== "string" ||
      !currentPassword.trim().length
    ) {
      throw new ClientError("Current password required");
    }
    await updateUserPasswordService(userId, currentPassword, newPassword);
  }

  if (wantsContact) {
    await updateUserContactService(
      userId,
      typeof address === "string" ? address : undefined,
      typeof phone === "string" ? phone : undefined,
    );
  }

  const refreshed = await getUserByIdService(userId);
  if (!refreshed) throw new ClientError("User not found", 404);
  res.status(200).send(toPublicUserJson(refreshed));
});

export const listUsersForAdmin = catchedController(
  async (_req: Request, res: Response) => {
    const rows = await listPublicUsersService();
    res.status(200).send(rows.map((u) => toPublicUserJson(u)));
  },
);
