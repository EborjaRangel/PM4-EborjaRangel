import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import {
  getSavedCartByClientUserIdService,
  upsertSavedCartService,
} from "../services/savedCart.service";

export const getSavedCartByClientUser = catchedController(
  async (req: Request, res: Response) => {
    const { clientUserId } = req.params;
    const row = await getSavedCartByClientUserIdService(clientUserId);
    if (!row) {
      res.json({
        clientUserId: (clientUserId ?? "").toString().trim(),
        items: [],
        updatedAt: null,
      });
      return;
    }
    res.json({
      clientUserId: row.clientUserId,
      items: row.items,
      updatedAt: row.updatedAt,
    });
  }
);

export const putSavedCartByClientUser = catchedController(
  async (req: Request, res: Response) => {
    const { clientUserId } = req.params;
    const items = req.body?.items;
    const row = await upsertSavedCartService(clientUserId, items ?? []);
    res.json({
      clientUserId: row.clientUserId,
      items: row.items,
      updatedAt: row.updatedAt,
    });
  }
);
