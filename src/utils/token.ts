import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../modules/users/user.model";

export interface TokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
}

export function signToken(userId: string, role: UserRole) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign({ role }, env.JWT_SECRET, { ...options, subject: userId });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}