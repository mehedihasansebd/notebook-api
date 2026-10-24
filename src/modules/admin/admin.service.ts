import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { AppError } from "../../utils/app-error";
import { NoteModel } from "../notes/note.model";
import { PostModel } from "../posts/post.model";
import { AdminCreateUserInput, AdminUpdateUserInput } from "../users/user.schema";
import { UserModel } from "../users/user.model";

export async function listUsers(skip: number, limit: number) {
  const [items, total] = await Promise.all([
    UserModel.find().sort({ _id: -1 }).skip(skip).limit(limit).select("-__v").lean(),
    UserModel.estimatedDocumentCount(),
  ]);
  return { items, total };
}

export async function getUser(id: string) {
  const user = await UserModel.findById(id).select("-__v").lean();
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function createUser(input: AdminCreateUserInput) {
  const password = await bcrypt.hash(input.password, 12);
  return UserModel.create({ ...input, password });
}

export async function updateUser(id: string, actorId: string, patch: AdminUpdateUserInput) {
  if (id === actorId && patch.role && patch.role !== "admin") {
    throw new AppError(400, "You cannot remove your own admin role");
  }

  const { password, ...rest } = patch;
  const update: Record<string, unknown> = { ...rest };
  if (password) update.password = await bcrypt.hash(password, 12);

  const user = await UserModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) throw new AppError(400, "You cannot delete your own account");

  const user = await UserModel.findByIdAndDelete(id);
  if (!user) throw new AppError(404, "User not found");

  // clean up what the user owned
  await Promise.all([
    NoteModel.deleteMany({ owner: user._id }),
    PostModel.deleteMany({ author: user._id }),
  ]);
}

export async function listAllNotes(skip: number, limit: number, owner?: string) {
  const filter = owner ? { owner: new Types.ObjectId(owner) } : {};

  const [items, total] = await Promise.all([
    NoteModel.find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email")
      .lean(),
    owner ? NoteModel.countDocuments(filter) : NoteModel.estimatedDocumentCount(),
  ]);
  return { items, total };
}