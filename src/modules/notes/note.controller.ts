import { asyncHandler } from "../../utils/async-handler";
import { pageMeta, parsePagination } from "../../utils/pagination";
import { idParamSchema } from "../../utils/validators";
import { createNoteSchema, updateNoteSchema } from "./note.schema";
import * as noteService from "./note.service";

export const create = asyncHandler(async (req, res) => {
  const input = createNoteSchema.parse(req.body);
  const note = await noteService.createNote(req.user!.id, input);
  res.status(201).json({ note });
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { items, total } = await noteService.listMyNotes(req.user!.id, skip, limit);
  res.json({ data: items, meta: pageMeta(total, page, limit) });
});

export const getOne = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const note = await noteService.getNote(id, req.user!);
  res.json({ note });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const patch = updateNoteSchema.parse(req.body);
  const note = await noteService.updateNote(id, req.user!.id, patch);
  res.json({ note });
});

export const remove = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await noteService.deleteNote(id, req.user!.id);
  res.status(204).send();
});