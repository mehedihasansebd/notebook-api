import { Types } from "mongoose";
import { AppError } from "../../utils/app-error";
import { UserRole } from "../users/user.model";
import { NoteModel } from "./note.model";
import { CreateNoteInput, UpdateNoteInput } from "./note.schema";

export async function createNote(ownerId: string, input: CreateNoteInput) {
  return NoteModel.create({ ...input, owner: new Types.ObjectId(ownerId) });
}

export async function listMyNotes(ownerId: string, skip: number, limit: number) {
  const filter = { owner: new Types.ObjectId(ownerId) };

  const [items, total] = await Promise.all([
    NoteModel.find(filter).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    NoteModel.countDocuments(filter),
  ]);

  return { items, total };
}

export async function getNote(id: string, viewer: { id: string; role: UserRole }) {
  const note = await NoteModel.findById(id).lean();

  const canView = note && (viewer.role === "admin" || note.owner.toString() === viewer.id);
  if (!note || !canView) {
    throw new AppError(404, "Note not found");
  }
  return note;
}

export async function updateNote(id: string, ownerId: string, patch: UpdateNoteInput) {
  // the owner check lives inside the query, so it is a single atomic operation
  const note = await NoteModel.findOneAndUpdate(
    { _id: id, owner: new Types.ObjectId(ownerId) },
    { $set: patch },
    { new: true, runValidators: true },
  );
  if (!note) {
    throw new AppError(404, "Note not found");
  }
  return note;
}

export async function deleteNote(id: string, ownerId: string) {
  const note = await NoteModel.findOneAndDelete({
    _id: id,
    owner: new Types.ObjectId(ownerId),
  });
  if (!note) {
    throw new AppError(404, "Note not found");
  }
}