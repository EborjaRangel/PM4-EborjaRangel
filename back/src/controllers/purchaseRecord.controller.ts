import { Request, Response } from "express";
import { catchedController } from "../utils/catchedController";
import {
  createPurchaseRecordService,
  getPurchasesByClientUserIdService,
} from "../services/purchaseRecord.service";

export const createPurchaseRecord = catchedController(
  async (req: Request, res: Response) => {
    const record = await createPurchaseRecordService(req.body);
    res.status(201).json(record);
  }
);

export const getPurchasesByClientUser = catchedController(
  async (req: Request, res: Response) => {
    const { clientUserId } = req.params;
    const records = await getPurchasesByClientUserIdService(clientUserId);
    res.json(records);
  }
);
