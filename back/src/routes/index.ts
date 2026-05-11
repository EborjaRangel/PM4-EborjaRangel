import { Router } from "express";
import usersRouter from "./users.router";
import ordersRouter from "./orders.router";
import productsRouter from "./products.router";
import purchasesRouter from "./purchases.router";
import cartRouter from "./cart.router";
import categoriesRouter from "./categories.router";
import addressesRouter from "./addresses.router";

const router = Router();

router.use("/users", usersRouter);
router.use("/orders", ordersRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/purchases", purchasesRouter);
router.use("/cart", cartRouter);
router.use("/addresses", addressesRouter);

export default router;
