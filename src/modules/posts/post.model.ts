import { InferSchemaType, Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, trim: true, maxlength: 10000 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

// posts of one author (used by the $lookup join)
postSchema.index({ author: 1, _id: -1 });

export type Post = InferSchemaType<typeof postSchema>;
export const PostModel = model("Post", postSchema);