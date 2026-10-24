import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { create, getOne, list } from "./post.controller";

export const postRouter = Router();

postRouter.get("/", list); // public
postRouter.get("/:id", getOne); // public
postRouter.post("/", authenticate, create);