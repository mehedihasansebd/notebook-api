import { InferSchemaType, Schema, model } from "mongoose";

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "user" },
    interests: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Partial<typeof ret>).password;
        delete (ret as Partial<typeof ret>).__v;
        return ret;
      },
    },
  },
);

// login and duplicate-email check
userSchema.index({ email: 1 }, { unique: true });

// grouping / filtering users by interest
userSchema.index({ interests: 1 });

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema);