import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../config/db";
import { NoteModel } from "../modules/notes/note.model";
import { PostModel } from "../modules/posts/post.model";
import { UserModel } from "../modules/users/user.model";

const PEOPLE = [
  { name: "Ayesha Rahman", email: "ayesha@example.com", interests: ["reading", "travel", "photography"] },
  { name: "Tanvir Hossain", email: "tanvir@example.com", interests: ["chess", "cricket"] },
  { name: "Nusrat Jahan", email: "nusrat@example.com", interests: ["cooking", "reading"] },
  { name: "Imran Khan", email: "imran@example.com", interests: ["chess", "music", "travel"] },
  { name: "Farzana Akter", email: "farzana@example.com", interests: ["photography", "music"] },
  { name: "Sabbir Ahmed", email: "sabbir@example.com", interests: ["cricket", "cooking"] },
];

async function seedSample() {
  await connectDb();
  await Promise.all([UserModel.init(), NoteModel.init(), PostModel.init()]);

  if (await UserModel.exists({ email: PEOPLE[0].email })) {
    console.log("Sample data already present, skipping.");
    return;
  }

  const password = await bcrypt.hash("Password123", 12);
  const users = await UserModel.insertMany(PEOPLE.map((p) => ({ ...p, password })));

  const notes = users.flatMap((u) =>
    [1, 2, 3].map((n) => ({
      title: `${u.name.split(" ")[0]}'s note ${n}`,
      content: `A few thoughts jotted down, entry ${n}.`,
      owner: u._id,
    })),
  );
  const posts = users.flatMap((u) =>
    [1, 2].map((n) => ({
      title: `${u.name.split(" ")[0]} writes: part ${n}`,
      body: `Sharing something I have been thinking about lately, part ${n}.`,
      author: u._id,
    })),
  );

  await Promise.all([NoteModel.insertMany(notes), PostModel.insertMany(posts)]);
  console.log(`Seeded ${users.length} users, ${notes.length} notes, ${posts.length} posts.`);
  console.log("All sample users share the password: Password123");
}

seedSample()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());