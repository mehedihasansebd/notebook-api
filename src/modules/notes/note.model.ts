import { InferSchemaType, Schema, model } from "mongoose";

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

// "my notes" list: filter by owner, newest first, paginated
noteSchema.index({ owner: 1, _id: -1 });

export type Note = InferSchemaType<typeof noteSchema>;
export const NoteModel = model("Note", noteSchema);