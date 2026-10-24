import { asyncHandler } from "../../utils/async-handler";
import { pageMeta, parsePagination } from "../../utils/pagination";
import { idParamSchema } from "../../utils/validators";
import { updateProfileSchema } from "./user.schema";
import * as userService from "./user.service";

export const updateMe = asyncHandler(async (req, res) => {
  const patch = updateProfileSchema.parse(req.body);
  const user = await userService.updateProfile(req.user!.id, patch);
  res.json({ user });
});

export const userPosts = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { page, limit, skip } = parsePagination(req.query);
  const { user, total } = await userService.getUserWithPosts(id, skip, limit);
  res.json({ user, meta: pageMeta(total, page, limit) });
});