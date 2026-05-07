import { Request, Response, Router } from "express";
import validateUserRegister from "../middlewares/userRegister.middleware";
import validateUserLogin from "../middlewares/userLogin.middleware";
import {
  getMe,
  listUsersForAdmin,
  login,
  patchMe,
  registerUser,
} from "../controllers/user.controller";
import checkLogin from "../middlewares/checkLogin.middleware";
import requireAdmin from "../middlewares/requireAdmin.middleware";
import { OrderRepository } from "../repositories/order.repository";

const usersRouter = Router();

usersRouter.post("/register", validateUserRegister, registerUser);

usersRouter.post("/login", validateUserLogin, login);

usersRouter.get("/me", checkLogin, getMe);

usersRouter.patch("/me", checkLogin, patchMe);

usersRouter.get("/", checkLogin, requireAdmin, listUsersForAdmin);

usersRouter.get("/orders", checkLogin, async (_req: Request, res: Response) => {
  const userId = res.locals.authUserId as number;
  const orders = await OrderRepository.find({
    relations: ["products"],
    where: { user: { id: userId } },
  });

  res.send(orders);
});

export default usersRouter;
