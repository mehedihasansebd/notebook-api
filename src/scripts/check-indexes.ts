import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../config/db";
import { NoteModel } from "../modules/notes/note.model";
import { PostModel } from "../modules/posts/post.model";
import { UserModel } from "../modules/users/user.model";

function report(label: string, plan: any) {
  const text = JSON.stringify(plan.queryPlanner.winningPlan);
  const stage = text.includes("IXSCAN") ? "IXSCAN" : "COLLSCAN";
  const index = text.match(/"indexName":"([^"]+)"/)?.[1] ?? "-";
  console.log(`${label.padEnd(34)} ${stage}  (${index})`);
}

async function main() {
  await connectDb();
  const user = await UserModel.findOne().lean();
  if (!user) return console.log("No users yet, run the seed first.");

  report("login by email", await UserModel.find({ email: user.email }).explain("queryPlanner"));
  report("my notes (owner + newest first)", await NoteModel.find({ owner: user._id }).sort({ _id: -1 }).limit(10).explain("queryPlanner"));
  report("posts of one author", await PostModel.find({ author: user._id }).sort({ _id: -1 }).limit(10).explain("queryPlanner"));
  report("users list (newest first)", await UserModel.find().sort({ _id: -1 }).limit(10).explain("queryPlanner"));
  report("notes list (newest first)", await NoteModel.find().sort({ _id: -1 }).limit(10).explain("queryPlanner"));
  report("users by interest filter", await UserModel.find({ interests: "chess" }).explain("queryPlanner"));
}

main().catch(console.error).finally(() => mongoose.disconnect());