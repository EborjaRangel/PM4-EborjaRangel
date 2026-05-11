import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import {
  createAddressService,
  deleteAddressService,
  listAddressesByUserService,
  setDefaultAddressService,
  updateAddressService,
} from "../services/addresses.service";

function getAuthUserId(res: Response): number {
  return res.locals.authUserId as number;
}

export const listMyAddresses = catchedController(
  async (_req: Request, res: Response) => {
    const userId = getAuthUserId(res);
    const rows = await listAddressesByUserService(userId);
    res.json(rows);
  },
);

export const createMyAddress = catchedController(
  async (req: Request, res: Response) => {
    const userId = getAuthUserId(res);
    const created = await createAddressService(userId, req.body ?? {});
    res.status(201).json(created);
  },
);

export const updateMyAddress = catchedController(
  async (req: Request, res: Response) => {
    const userId = getAuthUserId(res);
    const id = Number.parseInt(req.params.id, 10);
    const updated = await updateAddressService(id, userId, req.body ?? {});
    res.json(updated);
  },
);

export const deleteMyAddress = catchedController(
  async (req: Request, res: Response) => {
    const userId = getAuthUserId(res);
    const id = Number.parseInt(req.params.id, 10);
    await deleteAddressService(id, userId);
    res.status(204).send();
  },
);

export const markMyAddressDefault = catchedController(
  async (req: Request, res: Response) => {
    const userId = getAuthUserId(res);
    const id = Number.parseInt(req.params.id, 10);
    const updated = await setDefaultAddressService(id, userId);
    res.json(updated);
  },
);
