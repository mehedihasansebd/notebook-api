import { z } from "zod";
import { registerSchema } from "../auth/auth.schema";
import { USER_ROLES } from "./user.model";

const interests = z.array(z.string().trim().min(1).max(30)).max(10);

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    interests: interests.optional(),
  })
  .refine((d) => d.name !== undefined || d.interests !== undefined, {
    message: "Provide at least one field to update",
  });

export const adminCreateUserSchema = registerSchema.extend({
  role: z.enum(USER_ROLES).default("user"),
});

export const adminUpdateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(72),
    role: z.enum(USER_ROLES),
    interests,
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "Provide at least one field to update",
  });

export const interestQuerySchema = z.object({
  interest: z.string().trim().toLowerCase().min(1).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;