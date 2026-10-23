import { app } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { NoteModel } from "./modules/notes/note.model";
import { PostModel } from "./modules/posts/post.model";
import { UserModel } from "./modules/users/user.model";

async function start() {
  await connectDb();
  await Promise.all([UserModel.init(), NoteModel.init(), PostModel.init()]);
  app.listen(env.PORT, () => {
    console.log(`Notebook API running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});