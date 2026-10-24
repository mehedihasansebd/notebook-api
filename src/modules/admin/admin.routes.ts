import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import {
  createUser,
  deleteUser,
  getUser,
  listNotes,
  listUsers,
  updateUser,
  usersByInterest,
} from "./admin.controller";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("admin"));

adminRouter.get("/users", listUsers);
adminRouter.post("/users", createUser);
adminRouter.get("/users/by-interests", usersByInterest); // keep above /users/:id
adminRouter.get("/users/:id", getUser);
adminRouter.patch("/users/:id", updateUser);
adminRouter.delete("/users/:id", deleteUser);

adminRouter.get("/notes", listNotes);