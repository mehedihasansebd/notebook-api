import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb() {
  mongoose.connection.on("connected", () => console.log("MongoDB connected"));
  mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));

  await mongoose.connect(env.MONGO_URI);
}