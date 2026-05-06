import { Router } from "express";
import {
  getSavedCartByClientUser,
  putSavedCartByClientUser,
} from "../controllers/savedCart.controller";

const router = Router();

router.get("/user/:clientUserId", getSavedCartByClientUser);
router.put("/user/:clientUserId", putSavedCartByClientUser);

export default router;
