import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/error-handler";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// feature routes will be mounted here

app.use(notFound);
app.use(errorHandler);