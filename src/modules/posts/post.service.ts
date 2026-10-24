import { Types } from "mongoose";
import { AppError } from "../../utils/app-error";
import { PostModel } from "./post.model";
import { CreatePostInput } from "./post.schema";

export async function createPost(authorId: string, input: CreatePostInput) {
  return PostModel.create({ ...input, author: new Types.ObjectId(authorId) });
}

export async function listPosts(skip: number, limit: number) {
  const [items, total] = await Promise.all([
    PostModel.find().sort({ _id: -1 }).skip(skip).limit(limit).populate("author", "name").lean(),
    PostModel.estimatedDocumentCount(),
  ]);
  return { items, total };
}

export async function getPost(id: string) {
  const post = await PostModel.findById(id).populate("author", "name").lean();
  if (!post) throw new AppError(404, "Post not found");
  return post;
}