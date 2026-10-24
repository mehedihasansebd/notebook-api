import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { UserModel } from "../users/user.model";
import { loginSchema, registerSchema } from "./auth.schema";
import { loginUser, registerUser } from "./auth.service";

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const { user, token } = await registerUser(input);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const { user, token } = await loginUser(input);
  res.json({ user, token });
});

export const me = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  res.json({ user });
});