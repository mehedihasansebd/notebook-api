import bcrypt from "bcryptjs";
import { AppError } from "../../utils/app-error";
import { signToken } from "../../utils/token";
import { UserModel, UserRole } from "../users/user.model";
import { LoginInput, RegisterInput } from "./auth.schema";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const taken = await UserModel.exists({ email: input.email });
  if (taken) {
    throw new AppError(409, "This email is already registered");
  }

  const password = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    password,
    interests: input.interests ?? [],
  });

  const token = signToken(user.id, user.role as UserRole);
  return { user, token };
}

export async function loginUser(input: LoginInput) {
  // password has select:false, so we ask for it explicitly here
  const user = await UserModel.findOne({ email: input.email }).select("+password");

  const passwordOk = user ? await bcrypt.compare(input.password, user.password) : false;

  // same message for "no such user" and "wrong password" on purpose
  if (!user || !passwordOk) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken(user.id, user.role as UserRole);
  return { user, token };
}