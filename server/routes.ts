import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertGrafanaUserSchema, insertGrafanaOrgSchema, insertGrafanaTeamSchema } from "../shared/schema";
import * as grafanaApi from "./grafana";
import * as opoppoApi from "./opoppo";

// 認証関連のimportを削除しました

// ダミーユーザーAPIエンドポイント
const mockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ダミーユーザー情報を返すエンドポイント
  app.get("/api/user", (req, res) => {
    res.json(mockUser);
  });

  // Grafana Users API
  app.get("/api/grafana/users", async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit?.toString() || "10");
      const offset = parseInt(req.query.offset?.toString() || "0");
      const search = req.query.search?.toString();
      
      const users = await storage.getGrafanaUsers(limit, offset, search);
      const total = await storage.countGrafanaUsers(search);
      
      res.json({ users, total });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/grafana/users/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getGrafanaUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get organization memberships
      const memberships = await storage.getUserOrgMemberships(id);
      const orgs = await Promise.all(
        memberships.map(async (membership) => {
          const org = await storage.getGrafanaOrganization(membership.orgId);
          return {
            ...membership,
            name: org?.name,
          };
        })
      );
      
      // Get team memberships
      const teamMemberships = await storage.getUserTeamMemberships(id);
      const teams = await Promise.all(
        teamMemberships.map(async (membership) => {
          const team = await storage.getGrafanaTeam(membership.teamId);
          return {
            ...membership,
            name: team?.name,
          };
        })
      );
      
      res.json({ ...user, organizations: orgs, teams });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/grafana/users", async (req, res, next) => {
    try {
      const userData = insertGrafanaUserSchema.parse(req.body);
      const user = await storage.createGrafanaUser(userData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/grafana/users/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertGrafanaUserSchema.partial().parse(req.body);
      
      const user = await storage.updateGrafanaUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/grafana/users/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGrafanaUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Grafana Organizations API
  app.get("/api/grafana/organizations", async (req, res, next) => {
    try {
      const orgs = await storage.getGrafanaOrganizations();
      res.json(orgs);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/grafana/organizations/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const org = await storage.getGrafanaOrganization(id);
      
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      
      res.json(org);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/grafana/organizations", async (req, res, next) => {
    try {
      const orgData = insertGrafanaOrgSchema.parse(req.body);
      const org = await storage.createGrafanaOrganization(orgData);
      res.status(201).json(org);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/grafana/organizations/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const orgData = insertGrafanaOrgSchema.partial().parse(req.body);
      
      const org = await storage.updateGrafanaOrganization(id, orgData);
      
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      
      res.json(org);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/grafana/organizations/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGrafanaOrganization(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Grafana Teams API
  app.get("/api/grafana/teams", async (req, res, next) => {
    try {
      const orgId = req.query.orgId ? parseInt(req.query.orgId.toString()) : undefined;
      const teams = await storage.getGrafanaTeams(orgId);
      res.json(teams);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/grafana/teams/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getGrafanaTeam(id);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/grafana/teams", async (req, res, next) => {
    try {
      const teamData = insertGrafanaTeamSchema.parse(req.body);
      const team = await storage.createGrafanaTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/grafana/teams/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const teamData = insertGrafanaTeamSchema.partial().parse(req.body);
      
      const team = await storage.updateGrafanaTeam(id, teamData);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/grafana/teams/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGrafanaTeam(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // User Organization Membership API
  app.post("/api/grafana/users/:userId/organizations/:orgId", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const orgId = parseInt(req.params.orgId);
      const role = req.body.role || "Viewer";
      const isDefault = req.body.isDefault || false;
      
      const membership = await storage.createUserOrgMembership({
        userId,
        orgId,
        role,
        isDefault
      });
      
      res.status(201).json(membership);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/grafana/users/:userId/organizations/:orgId", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const orgId = parseInt(req.params.orgId);
      
      await storage.deleteUserOrgMembership(userId, orgId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // User Team Membership API
  app.post("/api/grafana/users/:userId/teams/:teamId", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const teamId = parseInt(req.params.teamId);
      
      const membership = await storage.createUserTeamMembership({
        userId,
        teamId
      });
      
      res.status(201).json(membership);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/grafana/users/:userId/teams/:teamId", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const teamId = parseInt(req.params.teamId);
      
      await storage.deleteUserTeamMembership(userId, teamId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Synchronization API
  app.get("/api/sync/logs", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit.toString()) : undefined;
      const logs = await storage.getSyncLogs(limit);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/sync/opoppo", async (req, res, next) => {
    try {
      const count = await opoppoApi.syncOPoppoUsersToGrafana();
      res.json({ count, status: "success" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/sync/grafana", async (req, res, next) => {
    try {
      const result = await grafanaApi.runFullSync();
      res.json({ ...result, status: "success" });
    } catch (error) {
      next(error);
    }
  });

  // Opoppo API
  app.get("/api/opoppo/users", async (req, res, next) => {
    try {
      const users = await opoppoApi.getOPoppoUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/opoppo/companies", async (req, res, next) => {
    try {
      const companies = await opoppoApi.getOPoppoCompanies();
      res.json(companies);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/opoppo/organizations", async (req, res, next) => {
    try {
      const organizations = await opoppoApi.getOPoppoOrganizations();
      res.json(organizations);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/opoppo/positions", async (req, res, next) => {
    try {
      const positions = await opoppoApi.getOPoppoPositions();
      res.json(positions);
    } catch (error) {
      next(error);
    }
  });

  // Settings API
  app.get("/api/settings/:key", async (req, res, next) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/settings/:key", async (req, res, next) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (typeof value !== "string") {
        return res.status(400).json({ message: "Value must be a string" });
      }
      
      const setting = await storage.updateSetting(key, value);
      res.json(setting);
    } catch (error) {
      next(error);
    }
  });

  // Stats API for dashboard
  app.get("/api/stats", async (req, res, next) => {
    try {
      const totalUsers = await storage.countGrafanaUsers();
      const activeUsers = await storage.countGrafanaUsers('active');
      const pendingUsers = await storage.countGrafanaUsers('pending');
      const organizations = (await storage.getGrafanaOrganizations()).length;
      const teams = (await storage.getGrafanaTeams()).length;
      
      // Last sync info
      const [lastSync] = await storage.getSyncLogs(1);
      
      res.json({
        totalUsers,
        activeUsers,
        pendingUsers,
        organizations,
        teams,
        lastSync: lastSync ? {
          time: lastSync.createdAt,
          type: lastSync.type,
          status: lastSync.status
        } : null
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
