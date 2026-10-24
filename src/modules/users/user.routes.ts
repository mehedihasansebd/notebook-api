import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { updateMe, userPosts } from "./user.controller";

export const userRouter = Router();

userRouter.patch("/me", authenticate, updateMe);
userRouter.get("/:id/posts", userPosts); // posts are public