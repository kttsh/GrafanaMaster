import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
});

// Grafana entities
export const grafanaUsers = pgTable("grafana_users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Opoppo USER_ID or Grafana user ID
  name: text("name"), // Full name
  email: text("email"),
  login: text("login"), // Login username in Grafana
  company: text("company"),
  department: text("department"),
  position: text("position"),
  grafanaId: integer("grafana_id"), // ID from Grafana API
  lastLogin: timestamp("last_login"),
  status: text("status").default("pending"), // active, pending, disabled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGrafanaUserSchema = createInsertSchema(grafanaUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const grafanaOrganizations = pgTable("grafana_organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  grafanaId: integer("grafana_id"), // ID from Grafana API
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGrafanaOrgSchema = createInsertSchema(grafanaOrganizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const grafanaTeams = pgTable("grafana_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  orgId: integer("org_id").notNull(), // Refers to grafana_organizations.id
  grafanaId: integer("grafana_id"), // ID from Grafana API
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGrafanaTeamSchema = createInsertSchema(grafanaTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const userOrganizationMemberships = pgTable("user_organization_memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Refers to grafana_users.id
  orgId: integer("org_id").notNull(), // Refers to grafana_organizations.id
  role: text("role").default("Viewer"), // Admin, Editor, Viewer
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserOrgMembershipSchema = createInsertSchema(userOrganizationMemberships).omit({
  id: true,
  createdAt: true,
});

export const userTeamMemberships = pgTable("user_team_memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Refers to grafana_users.id
  teamId: integer("team_id").notNull(), // Refers to grafana_teams.id
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserTeamMembershipSchema = createInsertSchema(userTeamMemberships).omit({
  id: true,
  createdAt: true,
});

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // opoppo_to_db, db_to_grafana
  status: text("status").notNull(), // success, error
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSyncLogSchema = createInsertSchema(syncLogs).omit({
  id: true,
  createdAt: true,
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GrafanaUser = typeof grafanaUsers.$inferSelect;
export type InsertGrafanaUser = z.infer<typeof insertGrafanaUserSchema>;

export type GrafanaOrganization = typeof grafanaOrganizations.$inferSelect;
export type InsertGrafanaOrg = z.infer<typeof insertGrafanaOrgSchema>;

export type GrafanaTeam = typeof grafanaTeams.$inferSelect;
export type InsertGrafanaTeam = z.infer<typeof insertGrafanaTeamSchema>;

export type UserOrgMembership = typeof userOrganizationMemberships.$inferSelect;
export type InsertUserOrgMembership = z.infer<typeof insertUserOrgMembershipSchema>;

export type UserTeamMembership = typeof userTeamMemberships.$inferSelect;
export type InsertUserTeamMembership = z.infer<typeof insertUserTeamMembershipSchema>;

export type SyncLog = typeof syncLogs.$inferSelect;
export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
