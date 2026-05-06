import { Router } from "express";
import {
  createPurchaseRecord,
  getPurchasesByClientUser,
} from "../controllers/purchaseRecord.controller";

const router = Router();

router.post("/", createPurchaseRecord);
router.get("/user/:clientUserId", getPurchasesByClientUser);

export default router;
