import express from "express";
import cors from "cors";
import { z } from "zod";
import { AlongRuntime } from "../core/runtime";

export interface AppOptions {
  repoPath: string;
  homeDir?: string;
}

export function createApp(options: AppOptions) {
  const app = express();
  const runtime = new AlongRuntime(options);

  app.use(cors({ origin: true }));
  app.use(express.json());

  app.post("/api/session/start", async (_req, res, next) => {
    try {
      res.json(await runtime.start());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/session/current", async (_req, res, next) => {
    try {
      res.json((await runtime.current()) ?? null);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/session/wrap-up", async (req, res, next) => {
    try {
      const parsed = z.object({ note: z.string().min(1) }).parse(req.body);
      res.json(await runtime.wrapUp(parsed.note));
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  });

  return app;
}
