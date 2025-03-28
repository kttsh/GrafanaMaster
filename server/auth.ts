import { Express } from "express";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  // ダミーユーザー認証を実装
  app.get("/api/user", (req, res) => {
    res.json({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    });
  });
}