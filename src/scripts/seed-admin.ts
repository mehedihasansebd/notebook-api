import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDb } from "../config/db";
import { UserModel } from "../modules/users/user.model";

const adminEnv = z.object({
  ADMIN_NAME: z.string().trim().min(2).default("Site Admin"),
  ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
  ADMIN_PASSWORD: z.string().min(8),
});

async function seedAdmin() {
  const parsed = adminEnv.safeParse(process.env);
  if (!parsed.success) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in .env first:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;

  await connectDb();
  await UserModel.init();

  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`Admin ${ADMIN_EMAIL} already exists, nothing to do.`);
    } else {
      existing.role = "admin";
      await existing.save();
      console.log(`${ADMIN_EMAIL} already existed as a user, promoted to admin.`);
    }
    return;
  }

  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await UserModel.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password,
    role: "admin",
  });
  console.log(`Admin created: ${ADMIN_EMAIL}`);
}

seedAdmin()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());