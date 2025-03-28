import { prisma } from "./db";
import { 
  type User, type InsertUser, 
  type GrafanaUser, type InsertGrafanaUser, 
  type GrafanaOrganization, type InsertGrafanaOrg, 
  type GrafanaTeam, type InsertGrafanaTeam, 
  type UserOrgMembership, type InsertUserOrgMembership,
  type UserTeamMembership, type InsertUserTeamMembership, 
  type SyncLog, type InsertSyncLog, 
  type Setting, type InsertSetting 
} from "../shared/types";

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
  
  // セッションストア機能は削除しました
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // 初期化処理が必要な場合はここに記述
  }
  
  // Auth user operations
  async getUser(id: number): Promise<User | undefined> {
    return await prisma.user.findUnique({
      where: { id }
    }) || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return await prisma.user.findUnique({
      where: { username }
    }) || undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    return await prisma.user.create({
      data: user
    });
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    return await prisma.user.update({
      where: { id },
      data: userData
    });
  }
  
  async deleteUser(id: number): Promise<boolean> {
    await prisma.user.delete({
      where: { id }
    });
    return true;
  }
  
  // Grafana user operations
  async getGrafanaUser(id: number): Promise<GrafanaUser | undefined> {
    return await prisma.grafanaUser.findUnique({
      where: { id }
    }) || undefined;
  }
  
  async getGrafanaUserByUserId(userId: string): Promise<GrafanaUser | undefined> {
    return await prisma.grafanaUser.findUnique({
      where: { userId }
    }) || undefined;
  }
  
  async getGrafanaUsers(limit: number = 100, offset: number = 0, search?: string): Promise<GrafanaUser[]> {
    let where = {};
    
    if (search) {
      where = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { userId: { contains: search } }
        ]
      };
    }
    
    return await prisma.grafanaUser.findMany({
      where,
      orderBy: { id: 'desc' },
      take: limit,
      skip: offset
    });
  }
  
  async countGrafanaUsers(search?: string): Promise<number> {
    let where = {};
    
    if (search) {
      where = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { userId: { contains: search } }
        ]
      };
    }
    
    return await prisma.grafanaUser.count({ where });
  }
  
  async createGrafanaUser(user: InsertGrafanaUser): Promise<GrafanaUser> {
    return await prisma.grafanaUser.create({
      data: user
    });
  }
  
  async updateGrafanaUser(id: number, userData: Partial<GrafanaUser>): Promise<GrafanaUser | undefined> {
    return await prisma.grafanaUser.update({
      where: { id },
      data: {
        ...userData,
        updatedAt: new Date()
      }
    });
  }
  
  async deleteGrafanaUser(id: number): Promise<boolean> {
    await prisma.grafanaUser.delete({
      where: { id }
    });
    return true;
  }
  
  // Grafana organization operations
  async getGrafanaOrganization(id: number): Promise<GrafanaOrganization | undefined> {
    return await prisma.grafanaOrganization.findUnique({
      where: { id }
    }) || undefined;
  }
  
  async getGrafanaOrganizations(): Promise<GrafanaOrganization[]> {
    return await prisma.grafanaOrganization.findMany({
      orderBy: { name: 'asc' }
    });
  }
  
  async createGrafanaOrganization(org: InsertGrafanaOrg): Promise<GrafanaOrganization> {
    return await prisma.grafanaOrganization.create({
      data: org
    });
  }
  
  async updateGrafanaOrganization(id: number, orgData: Partial<GrafanaOrganization>): Promise<GrafanaOrganization | undefined> {
    return await prisma.grafanaOrganization.update({
      where: { id },
      data: {
        ...orgData,
        updatedAt: new Date()
      }
    });
  }
  
  async deleteGrafanaOrganization(id: number): Promise<boolean> {
    await prisma.grafanaOrganization.delete({
      where: { id }
    });
    return true;
  }
  
  // Grafana team operations
  async getGrafanaTeam(id: number): Promise<GrafanaTeam | undefined> {
    return await prisma.grafanaTeam.findUnique({
      where: { id }
    }) || undefined;
  }
  
  async getGrafanaTeams(orgId?: number): Promise<GrafanaTeam[]> {
    const where = orgId !== undefined ? { orgId } : {};
    
    return await prisma.grafanaTeam.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }
  
  async createGrafanaTeam(team: InsertGrafanaTeam): Promise<GrafanaTeam> {
    return await prisma.grafanaTeam.create({
      data: team
    });
  }
  
  async updateGrafanaTeam(id: number, teamData: Partial<GrafanaTeam>): Promise<GrafanaTeam | undefined> {
    return await prisma.grafanaTeam.update({
      where: { id },
      data: {
        ...teamData,
        updatedAt: new Date()
      }
    });
  }
  
  async deleteGrafanaTeam(id: number): Promise<boolean> {
    await prisma.grafanaTeam.delete({
      where: { id }
    });
    return true;
  }
  
  // User organization membership operations
  async getUserOrgMemberships(userId: number): Promise<UserOrgMembership[]> {
    return await prisma.userOrgMembership.findMany({
      where: { userId }
    });
  }
  
  async createUserOrgMembership(membership: InsertUserOrgMembership): Promise<UserOrgMembership> {
    return await prisma.userOrgMembership.create({
      data: membership
    });
  }
  
  async deleteUserOrgMembership(userId: number, orgId: number): Promise<boolean> {
    await prisma.userOrgMembership.deleteMany({
      where: {
        userId,
        orgId
      }
    });
    return true;
  }
  
  // User team membership operations
  async getUserTeamMemberships(userId: number): Promise<UserTeamMembership[]> {
    return await prisma.userTeamMembership.findMany({
      where: { userId }
    });
  }
  
  async createUserTeamMembership(membership: InsertUserTeamMembership): Promise<UserTeamMembership> {
    return await prisma.userTeamMembership.create({
      data: membership
    });
  }
  
  async deleteUserTeamMembership(userId: number, teamId: number): Promise<boolean> {
    await prisma.userTeamMembership.deleteMany({
      where: {
        userId,
        teamId
      }
    });
    return true;
  }
  
  // Sync log operations
  async getSyncLogs(limit: number = 50): Promise<SyncLog[]> {
    return await prisma.syncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
  
  async createSyncLog(log: InsertSyncLog): Promise<SyncLog> {
    // Prismaの型との整合性をとるため、nullの場合は処理
    const details = log.details !== null ? log.details : undefined;
    
    return await prisma.syncLog.create({
      data: {
        ...log,
        details
      }
    });
  }
  
  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    return await prisma.setting.findUnique({
      where: { key }
    }) || undefined;
  }
  
  async updateSetting(key: string, value: string): Promise<Setting> {
    try {
      // Try to update existing setting
      return await prisma.setting.update({
        where: { key },
        data: {
          value,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      // If setting doesn't exist, create it
      return await prisma.setting.create({
        data: {
          key,
          value
        }
      });
    }
  }
}

export const storage = new DatabaseStorage();
