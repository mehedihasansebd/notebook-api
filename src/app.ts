import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/error-handler";
import { authRouter } from "./modules/auth/auth.routes";
import { noteRouter } from "./modules/notes/note.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { postRouter } from "./modules/posts/post.routes";
import { userRouter } from "./modules/users/user.routes";

export const app = express();

app.use(helmet());

// Combine environment-based origins and your Vercel frontend URL cleanly
const allowedOrigins = [
  ...(env.CLIENT_URL ? env.CLIENT_URL.split(",").map((url) => url.trim()) : []),
  "https://notebook-web-two.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/notes", noteRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);