import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(10000),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;