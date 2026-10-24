import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { create, getOne, list, remove, update } from "./note.controller";

export const noteRouter = Router();

noteRouter.use(authenticate);

noteRouter.post("/", create);
noteRouter.get("/", list);
noteRouter.get("/:id", getOne);
noteRouter.patch("/:id", update);
noteRouter.delete("/:id", remove);