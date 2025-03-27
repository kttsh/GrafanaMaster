import { users, grafanaUsers, grafanaOrganizations, grafanaTeams, 
  userOrganizationMemberships, userTeamMemberships, syncLogs, settings, 
  type User, type InsertUser, type GrafanaUser, type InsertGrafanaUser, 
  type GrafanaOrganization, type InsertGrafanaOrg, type GrafanaTeam, 
  type InsertGrafanaTeam, type UserOrgMembership, type InsertUserOrgMembership,
  type UserTeamMembership, type InsertUserTeamMembership, type SyncLog,
  type InsertSyncLog, type Setting, type InsertSetting } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql as sqlFn } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Auth user operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Grafana user operations
  getGrafanaUser(id: number): Promise<GrafanaUser | undefined>;
  getGrafanaUserByUserId(userId: string): Promise<GrafanaUser | undefined>;
  getGrafanaUsers(limit?: number, offset?: number, search?: string): Promise<GrafanaUser[]>;
  countGrafanaUsers(search?: string): Promise<number>;
  createGrafanaUser(user: InsertGrafanaUser): Promise<GrafanaUser>;
  updateGrafanaUser(id: number, user: Partial<GrafanaUser>): Promise<GrafanaUser | undefined>;
  deleteGrafanaUser(id: number): Promise<boolean>;
  
  // Grafana organization operations
  getGrafanaOrganization(id: number): Promise<GrafanaOrganization | undefined>;
  getGrafanaOrganizations(): Promise<GrafanaOrganization[]>;
  createGrafanaOrganization(org: InsertGrafanaOrg): Promise<GrafanaOrganization>;
  updateGrafanaOrganization(id: number, org: Partial<GrafanaOrganization>): Promise<GrafanaOrganization | undefined>;
  deleteGrafanaOrganization(id: number): Promise<boolean>;
  
  // Grafana team operations
  getGrafanaTeam(id: number): Promise<GrafanaTeam | undefined>;
  getGrafanaTeams(orgId?: number): Promise<GrafanaTeam[]>;
  createGrafanaTeam(team: InsertGrafanaTeam): Promise<GrafanaTeam>;
  updateGrafanaTeam(id: number, team: Partial<GrafanaTeam>): Promise<GrafanaTeam | undefined>;
  deleteGrafanaTeam(id: number): Promise<boolean>;
  
  // User organization membership operations
  getUserOrgMemberships(userId: number): Promise<UserOrgMembership[]>;
  createUserOrgMembership(membership: InsertUserOrgMembership): Promise<UserOrgMembership>;
  deleteUserOrgMembership(userId: number, orgId: number): Promise<boolean>;
  
  // User team membership operations
  getUserTeamMemberships(userId: number): Promise<UserTeamMembership[]>;
  createUserTeamMembership(membership: InsertUserTeamMembership): Promise<UserTeamMembership>;
  deleteUserTeamMembership(userId: number, teamId: number): Promise<boolean>;
  
  // Sync log operations
  getSyncLogs(limit?: number): Promise<SyncLog[]>;
  createSyncLog(log: InsertSyncLog): Promise<SyncLog>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
  }
  
  // Auth user operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }
  
  // Grafana user operations
  async getGrafanaUser(id: number): Promise<GrafanaUser | undefined> {
    const [user] = await db.select().from(grafanaUsers).where(eq(grafanaUsers.id, id));
    return user;
  }
  
  async getGrafanaUserByUserId(userId: string): Promise<GrafanaUser | undefined> {
    const [user] = await db.select().from(grafanaUsers).where(eq(grafanaUsers.userId, userId));
    return user;
  }
  
  async getGrafanaUsers(limit: number = 100, offset: number = 0, search?: string): Promise<GrafanaUser[]> {
    let query = db.select().from(grafanaUsers).orderBy(desc(grafanaUsers.id)).limit(limit).offset(offset);
    
    if (search) {
      query = query.where(
        sqlFn`(${grafanaUsers.name} ILIKE ${`%${search}%`} OR ${grafanaUsers.email} ILIKE ${`%${search}%`} OR ${grafanaUsers.userId} ILIKE ${`%${search}%`})`
      );
    }
    
    return await query;
  }
  
  async countGrafanaUsers(search?: string): Promise<number> {
    let query = db.select({ count: sqlFn`COUNT(*)` }).from(grafanaUsers);
    
    if (search) {
      query = query.where(
        sqlFn`(${grafanaUsers.name} ILIKE ${`%${search}%`} OR ${grafanaUsers.email} ILIKE ${`%${search}%`} OR ${grafanaUsers.userId} ILIKE ${`%${search}%`})`
      );
    }
    
    const result = await query;
    return Number(result[0]?.count || 0);
  }
  
  async createGrafanaUser(user: InsertGrafanaUser): Promise<GrafanaUser> {
    const [newUser] = await db.insert(grafanaUsers).values(user).returning();
    return newUser;
  }
  
  async updateGrafanaUser(id: number, userData: Partial<GrafanaUser>): Promise<GrafanaUser | undefined> {
    const now = new Date();
    const [updatedUser] = await db
      .update(grafanaUsers)
      .set({ ...userData, updatedAt: now })
      .where(eq(grafanaUsers.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteGrafanaUser(id: number): Promise<boolean> {
    await db.delete(grafanaUsers).where(eq(grafanaUsers.id, id));
    return true;
  }
  
  // Grafana organization operations
  async getGrafanaOrganization(id: number): Promise<GrafanaOrganization | undefined> {
    const [org] = await db.select().from(grafanaOrganizations).where(eq(grafanaOrganizations.id, id));
    return org;
  }
  
  async getGrafanaOrganizations(): Promise<GrafanaOrganization[]> {
    return await db.select().from(grafanaOrganizations).orderBy(grafanaOrganizations.name);
  }
  
  async createGrafanaOrganization(org: InsertGrafanaOrg): Promise<GrafanaOrganization> {
    const [newOrg] = await db.insert(grafanaOrganizations).values(org).returning();
    return newOrg;
  }
  
  async updateGrafanaOrganization(id: number, orgData: Partial<GrafanaOrganization>): Promise<GrafanaOrganization | undefined> {
    const now = new Date();
    const [updatedOrg] = await db
      .update(grafanaOrganizations)
      .set({ ...orgData, updatedAt: now })
      .where(eq(grafanaOrganizations.id, id))
      .returning();
    return updatedOrg;
  }
  
  async deleteGrafanaOrganization(id: number): Promise<boolean> {
    await db.delete(grafanaOrganizations).where(eq(grafanaOrganizations.id, id));
    return true;
  }
  
  // Grafana team operations
  async getGrafanaTeam(id: number): Promise<GrafanaTeam | undefined> {
    const [team] = await db.select().from(grafanaTeams).where(eq(grafanaTeams.id, id));
    return team;
  }
  
  async getGrafanaTeams(orgId?: number): Promise<GrafanaTeam[]> {
    let query = db.select().from(grafanaTeams);
    
    if (orgId !== undefined) {
      query = query.where(eq(grafanaTeams.orgId, orgId));
    }
    
    return await query.orderBy(grafanaTeams.name);
  }
  
  async createGrafanaTeam(team: InsertGrafanaTeam): Promise<GrafanaTeam> {
    const [newTeam] = await db.insert(grafanaTeams).values(team).returning();
    return newTeam;
  }
  
  async updateGrafanaTeam(id: number, teamData: Partial<GrafanaTeam>): Promise<GrafanaTeam | undefined> {
    const now = new Date();
    const [updatedTeam] = await db
      .update(grafanaTeams)
      .set({ ...teamData, updatedAt: now })
      .where(eq(grafanaTeams.id, id))
      .returning();
    return updatedTeam;
  }
  
  async deleteGrafanaTeam(id: number): Promise<boolean> {
    await db.delete(grafanaTeams).where(eq(grafanaTeams.id, id));
    return true;
  }
  
  // User organization membership operations
  async getUserOrgMemberships(userId: number): Promise<UserOrgMembership[]> {
    return await db
      .select()
      .from(userOrganizationMemberships)
      .where(eq(userOrganizationMemberships.userId, userId));
  }
  
  async createUserOrgMembership(membership: InsertUserOrgMembership): Promise<UserOrgMembership> {
    const [newMembership] = await db.insert(userOrganizationMemberships).values(membership).returning();
    return newMembership;
  }
  
  async deleteUserOrgMembership(userId: number, orgId: number): Promise<boolean> {
    await db
      .delete(userOrganizationMemberships)
      .where(
        and(
          eq(userOrganizationMemberships.userId, userId),
          eq(userOrganizationMemberships.orgId, orgId)
        )
      );
    return true;
  }
  
  // User team membership operations
  async getUserTeamMemberships(userId: number): Promise<UserTeamMembership[]> {
    return await db
      .select()
      .from(userTeamMemberships)
      .where(eq(userTeamMemberships.userId, userId));
  }
  
  async createUserTeamMembership(membership: InsertUserTeamMembership): Promise<UserTeamMembership> {
    const [newMembership] = await db.insert(userTeamMemberships).values(membership).returning();
    return newMembership;
  }
  
  async deleteUserTeamMembership(userId: number, teamId: number): Promise<boolean> {
    await db
      .delete(userTeamMemberships)
      .where(
        and(
          eq(userTeamMemberships.userId, userId),
          eq(userTeamMemberships.teamId, teamId)
        )
      );
    return true;
  }
  
  // Sync log operations
  async getSyncLogs(limit: number = 50): Promise<SyncLog[]> {
    return await db
      .select()
      .from(syncLogs)
      .orderBy(desc(syncLogs.createdAt))
      .limit(limit);
  }
  
  async createSyncLog(log: InsertSyncLog): Promise<SyncLog> {
    const [newLog] = await db.insert(syncLogs).values(log).returning();
    return newLog;
  }
  
  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }
  
  async updateSetting(key: string, value: string): Promise<Setting> {
    const now = new Date();
    
    // Try to update existing setting
    const [existingSetting] = await db
      .update(settings)
      .set({ value, updatedAt: now })
      .where(eq(settings.key, key))
      .returning();
    
    if (existingSetting) {
      return existingSetting;
    }
    
    // If setting doesn't exist, create it
    const [newSetting] = await db
      .insert(settings)
      .values({ key, value })
      .returning();
    
    return newSetting;
  }
}

export const storage = new DatabaseStorage();
