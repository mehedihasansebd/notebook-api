import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(150),
  content: z.string().trim().min(1).max(10000),
});

export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    content: z.string().trim().min(1).max(10000).optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "Provide at least one field to update",
  });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;