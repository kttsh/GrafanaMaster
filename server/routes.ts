import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { type InsertGrafanaUser } from "../shared/types";

export async function registerRoutes(app: Express) {
  // Basic CRUD for users
  app.get("/api/grafana/users", async (req, res) => {
    const users = await storage.getGrafanaUsers(10, 0);
    res.json(users);
  });

  app.get("/api/grafana/users/:id", async (req, res) => {
    const user = await storage.getGrafanaUser(parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  });

  const userSchema = z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string().optional()
  });

  app.post("/api/grafana/users", async (req, res) => {
    const userData = userSchema.parse(req.body) as InsertGrafanaUser;
    const user = await storage.createGrafanaUser(userData);
    res.status(201).json(user);
  });

  app.put("/api/grafana/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const userData = userSchema.partial().parse(req.body);
    const user = await storage.updateGrafanaUser(id, userData);
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  });

  app.delete("/api/grafana/users/:id", async (req, res) => {
    await storage.deleteGrafanaUser(parseInt(req.params.id));
    res.status(204).send();
  });

  return createServer(app);
}