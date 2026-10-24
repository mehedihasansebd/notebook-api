import { z } from "zod";
import { asyncHandler } from "../../utils/async-handler";
import { pageMeta, parsePagination } from "../../utils/pagination";
import { idParamSchema } from "../../utils/validators";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  interestQuerySchema,
} from "../users/user.schema";
import { groupUsersByInterest } from "../users/user.service";
import * as adminService from "./admin.service";

const notesQuerySchema = z.object({
  owner: z.string().regex(/^[a-f\d]{24}$/i, "Invalid owner id").optional(),
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { items, total } = await adminService.listUsers(skip, limit);
  res.json({ data: items, meta: pageMeta(total, page, limit) });
});

export const getUser = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  res.json({ user: await adminService.getUser(id) });
});

export const createUser = asyncHandler(async (req, res) => {
  const input = adminCreateUserSchema.parse(req.body);
  res.status(201).json({ user: await adminService.createUser(input) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const patch = adminUpdateUserSchema.parse(req.body);
  res.json({ user: await adminService.updateUser(id, req.user!.id, patch) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await adminService.deleteUser(id, req.user!.id);
  res.status(204).send();
});

export const usersByInterest = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { interest } = interestQuerySchema.parse(req.query);
  const { items, total } = await groupUsersByInterest({ interest, skip, limit });
  res.json({ data: items, meta: pageMeta(total, page, limit) });
});

export const listNotes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { owner } = notesQuerySchema.parse(req.query);
  const { items, total } = await adminService.listAllNotes(skip, limit, owner);
  res.json({ data: items, meta: pageMeta(total, page, limit) });
});