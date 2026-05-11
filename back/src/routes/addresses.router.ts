import { Router } from "express";
import checkLogin from "../middlewares/checkLogin.middleware";
import {
  createMyAddress,
  deleteMyAddress,
  listMyAddresses,
  markMyAddressDefault,
  updateMyAddress,
} from "../controllers/address.controller";

const addressesRouter = Router();

addressesRouter.use(checkLogin);
addressesRouter.get("/", listMyAddresses);
addressesRouter.post("/", createMyAddress);
addressesRouter.put("/:id", updateMyAddress);
addressesRouter.delete("/:id", deleteMyAddress);
addressesRouter.post("/:id/default", markMyAddressDefault);

export default addressesRouter;
