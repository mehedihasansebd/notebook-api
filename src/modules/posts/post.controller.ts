import { asyncHandler } from "../../utils/async-handler";
import { pageMeta, parsePagination } from "../../utils/pagination";
import { idParamSchema } from "../../utils/validators";
import { createPostSchema } from "./post.schema";
import * as postService from "./post.service";

export const create = asyncHandler(async (req, res) => {
  const input = createPostSchema.parse(req.body);
  const post = await postService.createPost(req.user!.id, input);
  res.status(201).json({ post });
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { items, total } = await postService.listPosts(skip, limit);
  res.json({ data: items, meta: pageMeta(total, page, limit) });
});

export const getOne = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  res.json({ post: await postService.getPost(id) });
});