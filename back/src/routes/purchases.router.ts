import { Router } from "express";
import {
  createPurchaseRecord,
  getPurchaseById,
  getPurchasesByClientUser,
} from "../controllers/purchaseRecord.controller";

const router = Router();

router.post("/", createPurchaseRecord);
router.get("/user/:clientUserId", getPurchasesByClientUser);
router.get("/:id", getPurchaseById);

export default router;
