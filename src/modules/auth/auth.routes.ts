import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { login, me, register } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticate, me);