
import { Express } from "express";

export function setupAuth(app: Express) {
  app.get("/api/user", (_, res) => res.json({ id: 1 }));
}
