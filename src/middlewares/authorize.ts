import { NextFunction, Request, Response } from "express";
import { UserRole } from "../modules/users/user.model";
import { AppError } from "../utils/app-error";

// usage: router.use(authenticate, authorize("admin"))
export function authorize(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }
    if (!allowed.includes(req.user.role)) {
      throw new AppError(403, "You do not have permission to do this");
    }
    next();
  };
}