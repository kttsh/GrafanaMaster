import axios from "axios";
import { storage } from "./storage";
import { isDevelopmentMode, logMessage } from "./utils";
import { 
  mockGrafanaOrgs, 
  mockGrafanaUsers, 
  mockGrafanaTeams, 
  mockTeamMembers,
  mockUserOrgMemberships 
} from "./mocks/grafana-mock";
import { 
  type GrafanaUser, 
  type GrafanaOrganization, 
  type GrafanaTeam,
  type InsertGrafanaUser,
  type InsertGrafanaOrg,
  type InsertGrafanaTeam,
  type InsertUserOrgMembership,
  type InsertUserTeamMembership
} from "../shared/schema";

// Get Grafana API configuration from environment variables
const GRAFANA_URL = process.env.GRAFANA_URL || 'http://localhost:3000';
const GRAFANA_ADMIN_USER = process.env.GRAFANA_ADMIN_USER || 'admin';
const GRAFANA_ADMIN_PASSWORD = process.env.GRAFANA_ADMIN_PASSWORD || 'admin';

// API client with basic auth (only initialized in production mode)
let grafanaApi: ReturnType<typeof axios.create> | null = null;

if (!isDevelopmentMode()) {
  grafanaApi = axios.create({
    baseURL: GRAFANA_URL,
    auth: {
      username: GRAFANA_ADMIN_USER,
      password: GRAFANA_ADMIN_PASSWORD
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Log API errors
  grafanaApi.interceptors.response.use(
    response => response,
    error => {
      console.error('Grafana API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  
  logMessage('Initialized Grafana API client for production mode');
} else {
  logMessage('Using mock data for Grafana API in development mode', 'info');
}

// Organization API
export async function getGrafanaOrgs(): Promise<any[]> {
  // 開発モードの場合はモックデータを返す
  if (isDevelopmentMode()) {
    logMessage('Returning mock Grafana organizations');
    return mockGrafanaOrgs;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.get('/api/orgs');
    return response.data;
  } catch (error) {
    console.error('Failed to get Grafana organizations:', error);
    return [];
  }
}

export async function getGrafanaOrgById(orgId: number): Promise<any> {
  // 開発モードの場合はモックデータから検索
  if (isDevelopmentMode()) {
    logMessage(`Finding mock Grafana organization with ID: ${orgId}`);
    const org = mockGrafanaOrgs.find(o => o.id === orgId);
    if (!org) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }
    return org;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.get(`/api/orgs/${orgId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get Grafana organization with ID ${orgId}:`, error);
    throw error;
  }
}

export async function createGrafanaOrg(name: string): Promise<any> {
  // 開発モードの場合は新しいID生成してモックに追加
  if (isDevelopmentMode()) {
    logMessage(`Creating mock Grafana organization: ${name}`);
    const newId = Math.max(0, ...mockGrafanaOrgs.map(o => o.id)) + 1;
    const newOrg = {
      id: newId,
      name,
      address: {
        city: "Tokyo",
        country: "Japan",
        state: "",
        address1: "",
        address2: "",
        zipCode: ""
      }
    };
    mockGrafanaOrgs.push(newOrg);
    return { orgId: newId };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.post('/api/orgs', { name });
    return response.data;
  } catch (error) {
    console.error('Failed to create Grafana organization:', error);
    throw error;
  }
}

export async function updateGrafanaOrg(orgId: number, name: string): Promise<any> {
  // 開発モードの場合はモックデータを更新
  if (isDevelopmentMode()) {
    logMessage(`Updating mock Grafana organization ID ${orgId} to name: ${name}`);
    const orgIndex = mockGrafanaOrgs.findIndex(o => o.id === orgId);
    if (orgIndex === -1) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }
    mockGrafanaOrgs[orgIndex].name = name;
    return { message: "Organization updated" };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.put(`/api/orgs/${orgId}`, { name });
    return response.data;
  } catch (error) {
    console.error(`Failed to update Grafana organization with ID ${orgId}:`, error);
    throw error;
  }
}

export async function deleteGrafanaOrg(orgId: number): Promise<boolean> {
  // 開発モードの場合はモックデータから削除
  if (isDevelopmentMode()) {
    logMessage(`Deleting mock Grafana organization ID ${orgId}`);
    const orgIndex = mockGrafanaOrgs.findIndex(o => o.id === orgId);
    if (orgIndex === -1) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }
    mockGrafanaOrgs.splice(orgIndex, 1);
    return true;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    await grafanaApi.delete(`/api/orgs/${orgId}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete Grafana organization with ID ${orgId}:`, error);
    throw error;
  }
}

// User API
export async function getGrafanaUsers(): Promise<any[]> {
  // 開発モードの場合はモックデータを返す
  if (isDevelopmentMode()) {
    logMessage('Returning mock Grafana users');
    return mockGrafanaUsers;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Failed to get Grafana users:', error);
    return [];
  }
}

export async function getGrafanaUserById(userId: number): Promise<any> {
  // 開発モードの場合はモックデータから検索
  if (isDevelopmentMode()) {
    logMessage(`Finding mock Grafana user with ID: ${userId}`);
    const user = mockGrafanaUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get Grafana user with ID ${userId}:`, error);
    throw error;
  }
}

export async function createGrafanaUser(userData: {
  name: string;
  email: string;
  login: string;
  password: string;
}): Promise<any> {
  // 開発モードの場合は新しいID生成してモックに追加
  if (isDevelopmentMode()) {
    logMessage(`Creating mock Grafana user: ${userData.name}`);
    const newId = Math.max(0, ...mockGrafanaUsers.map(u => u.id)) + 1;
    const newUser = {
      id: newId,
      email: userData.email,
      name: userData.name,
      login: userData.login,
      role: "Viewer",
      isDisabled: false,
      isExternal: false,
      authLabels: ["OAuth"],
      lastSeenAt: new Date().toISOString(),
      lastSeenAtAge: "just now"
    };
    mockGrafanaUsers.push(newUser);
    return { id: newId };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.post('/api/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Failed to create Grafana user:', error);
    throw error;
  }
}

export async function updateGrafanaUser(userId: number, userData: {
  name?: string;
  email?: string;
  login?: string;
  theme?: string;
}): Promise<any> {
  // 開発モードの場合はモックデータを更新
  if (isDevelopmentMode()) {
    logMessage(`Updating mock Grafana user ID ${userId}`);
    const userIndex = mockGrafanaUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // 更新可能なフィールドを反映
    if (userData.name) mockGrafanaUsers[userIndex].name = userData.name;
    if (userData.email) mockGrafanaUsers[userIndex].email = userData.email;
    if (userData.login) mockGrafanaUsers[userIndex].login = userData.login;
    
    return { message: "User updated" };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update Grafana user with ID ${userId}:`, error);
    throw error;
  }
}

export async function deleteGrafanaUser(userId: number): Promise<boolean> {
  // 開発モードの場合はモックデータから削除
  if (isDevelopmentMode()) {
    logMessage(`Deleting mock Grafana user ID ${userId}`);
    const userIndex = mockGrafanaUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }
    mockGrafanaUsers.splice(userIndex, 1);
    
    // ユーザーの組織メンバーシップも削除
    // 型アサーションでTypeScriptエラーを回避
    const memberships = mockUserOrgMemberships as Record<number, { orgId: number; role: string }[]>;
    if (memberships[userId]) {
      delete memberships[userId];
    }
    
    // ユーザーのチームメンバーシップも削除
    for (const teamId in mockTeamMembers) {
      if (Object.prototype.hasOwnProperty.call(mockTeamMembers, teamId)) {
        // 型アサーションを使用
        const teams = mockTeamMembers as Record<string, { userId: number; name: string; email: string; login: string; avatarUrl: string; labels: string[] }[]>;
        const teamMembers = teams[teamId];
        const memberIndex = teamMembers.findIndex((m: { userId: number }) => m.userId === userId);
        if (memberIndex !== -1) {
          teamMembers.splice(memberIndex, 1);
          
          // チームのメンバー数を更新
          const teamIndex = mockGrafanaTeams.findIndex(t => t.id === parseInt(teamId));
          if (teamIndex !== -1) {
            mockGrafanaTeams[teamIndex].memberCount--;
          }
        }
      }
    }
    
    return true;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    await grafanaApi.delete(`/api/admin/users/${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete Grafana user with ID ${userId}:`, error);
    throw error;
  }
}

// User organization membership
export async function addUserToOrg(orgId: number, userId: number, role: string = 'Viewer'): Promise<any> {
  // 開発モードの場合はモックデータを更新
  if (isDevelopmentMode()) {
    logMessage(`Adding mock user ${userId} to organization ${orgId} with role ${role}`);
    
    // 組織が存在するか確認
    const org = mockGrafanaOrgs.find(o => o.id === orgId);
    if (!org) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }
    
    // ユーザーが存在するか確認
    const user = mockGrafanaUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // ユーザーがすでに組織に所属しているか確認
    const memberships = mockUserOrgMemberships as Record<number, { orgId: number; role: string }[]>;
    if (!memberships[userId]) {
      memberships[userId] = [];
    }
    
    const isMember = memberships[userId].some((m: { orgId: number }) => m.orgId === orgId);
    if (isMember) {
      throw new Error(`User ${userId} is already a member of organization ${orgId}`);
    }
    
    // ユーザーを組織に追加
    memberships[userId].push({ orgId, role });
    
    return { message: "User added to organization" };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.post(`/api/orgs/${orgId}/users`, {
      loginOrEmail: userId.toString(),
      role
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to add user ${userId} to organization ${orgId}:`, error);
    throw error;
  }
}

export async function updateUserOrgRole(orgId: number, userId: number, role: string): Promise<any> {
  // 開発モードの場合はモックデータを更新
  if (isDevelopmentMode()) {
    logMessage(`Updating mock user ${userId} role in organization ${orgId} to ${role}`);
    
    // 組織が存在するか確認
    const org = mockGrafanaOrgs.find(o => o.id === orgId);
    if (!org) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }
    
    // ユーザーが存在するか確認
    const user = mockGrafanaUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // ユーザーが組織に所属しているか確認
    const memberships = mockUserOrgMemberships as Record<number, { orgId: number; role: string }[]>;
    if (!memberships[userId]) {
      throw new Error(`User ${userId} is not a member of any organization`);
    }
    
    const membershipIndex = memberships[userId].findIndex((m: { orgId: number }) => m.orgId === orgId);
    if (membershipIndex === -1) {
      throw new Error(`User ${userId} is not a member of organization ${orgId}`);
    }
    
    // ユーザーの役割を更新
    memberships[userId][membershipIndex].role = role;
    
    return { message: "User role updated" };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    const response = await grafanaApi.patch(`/api/orgs/${orgId}/users/${userId}`, { role });
    return response.data;
  } catch (error) {
    console.error(`Failed to update role for user ${userId} in organization ${orgId}:`, error);
    throw error;
  }
}

export async function removeUserFromOrg(orgId: number, userId: number): Promise<boolean> {
  // 開発モードの場合はモックデータを更新
  if (isDevelopmentMode()) {
    logMessage(`Removing mock user ${userId} from organization ${orgId}`);
    
    // 組織が存在するか確認
    const org = mockGrafanaOrgs.find(o => o.id === orgId);
    if (!org) {
      throw new Error(`Organization with ID ${orgId} not found`);
    }
    
    // ユーザーが存在するか確認
    const user = mockGrafanaUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // ユーザーが組織に所属しているか確認
    const memberships = mockUserOrgMemberships as Record<number, { orgId: number; role: string }[]>;
    if (!memberships[userId]) {
      throw new Error(`User ${userId} is not a member of any organization`);
    }
    
    const membershipIndex = memberships[userId].findIndex((m: { orgId: number }) => m.orgId === orgId);
    if (membershipIndex === -1) {
      throw new Error(`User ${userId} is not a member of organization ${orgId}`);
    }
    
    // ユーザーを組織から削除
    memberships[userId].splice(membershipIndex, 1);
    
    // 組織に属するチームからもユーザーを削除
    const orgTeams = mockGrafanaTeams.filter(t => t.orgId === orgId);
    for (const team of orgTeams) {
      if (mockTeamMembers[team.id]) {
        const memberIndex = mockTeamMembers[team.id].findIndex(m => m.userId === userId);
        if (memberIndex !== -1) {
          mockTeamMembers[team.id].splice(memberIndex, 1);
          
          // チームのメンバー数を更新
          const teamIndex = mockGrafanaTeams.findIndex(t => t.id === team.id);
          if (teamIndex !== -1) {
            mockGrafanaTeams[teamIndex].memberCount--;
          }
        }
      }
    }
    
    return true;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    await grafanaApi.delete(`/api/orgs/${orgId}/users/${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to remove user ${userId} from organization ${orgId}:`, error);
    throw error;
  }
}

// Team API
export async function getGrafanaTeams(orgId: number): Promise<any[]> {
  // 開発モードの場合はモックデータを返す
  if (isDevelopmentMode()) {
    logMessage(`Returning mock Grafana teams for organization ${orgId}`);
    
    // 特定の組織に属するチームのみをフィルタリング
    return mockGrafanaTeams.filter(team => team.orgId === orgId);
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    // Switch to the specific organization context first
    await grafanaApi.post(`/api/user/using/${orgId}`);
    
    const response = await grafanaApi.get('/api/teams/search?perpage=100');
    return response.data.teams || [];
  } catch (error) {
    console.error(`Failed to get teams for organization ${orgId}:`, error);
    return [];
  }
}

export async function getGrafanaTeam(orgId: number, teamId: number): Promise<any> {
  // 開発モードの場合はモックデータから検索
  if (isDevelopmentMode()) {
    logMessage(`Finding mock Grafana team with ID: ${teamId} in organization ${orgId}`);
    const team = mockGrafanaTeams.find(t => t.id === teamId && t.orgId === orgId);
    if (!team) {
      throw new Error(`Team with ID ${teamId} not found in organization ${orgId}`);
    }
    return team;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    // Switch to the specific organization context first
    await grafanaApi.post(`/api/user/using/${orgId}`);
    
    const response = await grafanaApi.get(`/api/teams/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get team with ID ${teamId}:`, error);
    throw error;
  }
}

export async function createGrafanaTeam(orgId: number, teamData: {
  name: string;
  email?: string;
}): Promise<any> {
  // 開発モードの場合は新しいID生成してモックに追加
  if (isDevelopmentMode()) {
    logMessage(`Creating mock Grafana team: ${teamData.name} in organization ${orgId}`);
    const newId = Math.max(0, ...mockGrafanaTeams.map(t => t.id)) + 1;
    const newTeam = {
      id: newId,
      name: teamData.name,
      email: teamData.email || `${teamData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      orgId: orgId,
      memberCount: 0
    };
    mockGrafanaTeams.push(newTeam);
    return { teamId: newId };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    // Switch to the specific organization context first
    await grafanaApi.post(`/api/user/using/${orgId}`);
    
    const response = await grafanaApi.post('/api/teams', teamData);
    return response.data;
  } catch (error) {
    console.error('Failed to create team:', error);
    throw error;
  }
}

export async function updateGrafanaTeam(orgId: number, teamId: number, teamData: {
  name: string;
  email?: string;
}): Promise<any> {
  // 開発モードの場合はモックデータを更新
  if (isDevelopmentMode()) {
    logMessage(`Updating mock Grafana team ID ${teamId} to name: ${teamData.name}`);
    const teamIndex = mockGrafanaTeams.findIndex(t => t.id === teamId && t.orgId === orgId);
    if (teamIndex === -1) {
      throw new Error(`Team with ID ${teamId} not found in organization ${orgId}`);
    }
    mockGrafanaTeams[teamIndex].name = teamData.name;
    if (teamData.email) {
      mockGrafanaTeams[teamIndex].email = teamData.email;
    }
    return { message: "Team updated" };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    // Switch to the specific organization context first
    await grafanaApi.post(`/api/user/using/${orgId}`);
    
    const response = await grafanaApi.put(`/api/teams/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update team with ID ${teamId}:`, error);
    throw error;
  }
}

export async function deleteGrafanaTeam(orgId: number, teamId: number): Promise<boolean> {
  // 開発モードの場合はモックデータから削除
  if (isDevelopmentMode()) {
    logMessage(`Deleting mock Grafana team ID ${teamId} from organization ${orgId}`);
    const teamIndex = mockGrafanaTeams.findIndex(t => t.id === teamId && t.orgId === orgId);
    if (teamIndex === -1) {
      throw new Error(`Team with ID ${teamId} not found in organization ${orgId}`);
    }
    mockGrafanaTeams.splice(teamIndex, 1);
    
    // チームメンバーのデータも削除
    const teams = mockTeamMembers as Record<number, { userId: number; name: string; email: string; login: string; avatarUrl: string; labels: string[] }[]>;
    if (teams[teamId]) {
      delete teams[teamId];
    }
    
    return true;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    // Switch to the specific organization context first
    await grafanaApi.post(`/api/user/using/${orgId}`);
    
    await grafanaApi.delete(`/api/teams/${teamId}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete team with ID ${teamId}:`, error);
    throw error;
  }
}

// Team membership
export async function getTeamMembers(orgId: number, teamId: number): Promise<any[]> {
  // 開発モードの場合はモックデータを返す
  if (isDevelopmentMode()) {
    logMessage(`Returning mock team members for team ${teamId} in organization ${orgId}`);
    
    // チームが存在するか確認
    const teamExists = mockGrafanaTeams.some(t => t.id === teamId && t.orgId === orgId);
    if (!teamExists) {
      throw new Error(`Team with ID ${teamId} not found in organization ${orgId}`);
    }
    
    // チームのメンバーを返す
    const teams = mockTeamMembers as Record<number, { userId: number; name: string; email: string; login: string; avatarUrl: string; labels: string[] }[]>;
    return teams[teamId] || [];
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    // Switch to the specific organization context first
    await grafanaApi.post(`/api/user/using/${orgId}`);
    
    const response = await grafanaApi.get(`/api/teams/${teamId}/members`);
    return response.data || [];
  } catch (error) {
    console.error(`Failed to get members for team ${teamId}:`, error);
    return [];
  }
}

export async function addUserToTeam(orgId: number, teamId: number, userId: number): Promise<any> {
  // 開発モードの場合はモックデータを更新
  if (isDevelopmentMode()) {
    logMessage(`Adding mock user ${userId} to team ${teamId} in organization ${orgId}`);
    
    // チームが存在するか確認
    const team = mockGrafanaTeams.find(t => t.id === teamId && t.orgId === orgId);
    if (!team) {
      throw new Error(`Team with ID ${teamId} not found in organization ${orgId}`);
    }
    
    // ユーザーが存在するか確認
    const user = mockGrafanaUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // ユーザーがすでにチームに所属しているか確認
    const teams = mockTeamMembers as Record<number, { userId: number; name: string; email: string; login: string; avatarUrl: string; labels: string[] }[]>;
    if (!teams[teamId]) {
      teams[teamId] = [];
    }
    
    const isMember = teams[teamId].some((m: { userId: number }) => m.userId === userId);
    if (isMember) {
      throw new Error(`User ${userId} is already a member of team ${teamId}`);
    }
    
    // ユーザーをチームに追加
    const newMember = {
      userId: userId,
      name: user.name,
      email: user.email,
      login: user.login,
      avatarUrl: `/avatar/${userId}`,
      labels: []
    };
    
    teams[teamId].push(newMember);
    
    // チームのメンバー数を更新
    const teamIndex = mockGrafanaTeams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      mockGrafanaTeams[teamIndex].memberCount++;
    }
    
    return { message: "Member added to team" };
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    // Switch to the specific organization context first
    await grafanaApi.post(`/api/user/using/${orgId}`);
    
    const response = await grafanaApi.post(`/api/teams/${teamId}/members`, {
      userId: userId
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to add user ${userId} to team ${teamId}:`, error);
    throw error;
  }
}

export async function removeUserFromTeam(orgId: number, teamId: number, userId: number): Promise<boolean> {
  // 開発モードの場合はモックデータを更新
  if (isDevelopmentMode()) {
    logMessage(`Removing mock user ${userId} from team ${teamId} in organization ${orgId}`);
    
    // チームが存在するか確認
    const team = mockGrafanaTeams.find(t => t.id === teamId && t.orgId === orgId);
    if (!team) {
      throw new Error(`Team with ID ${teamId} not found in organization ${orgId}`);
    }
    
    // チームメンバーが存在するか確認
    const teams = mockTeamMembers as Record<number, { userId: number; name: string; email: string; login: string; avatarUrl: string; labels: string[] }[]>;
    if (!teams[teamId]) {
      throw new Error(`Team ${teamId} has no members`);
    }
    
    // ユーザーがチームに所属しているか確認
    const memberIndex = teams[teamId].findIndex((m: { userId: number }) => m.userId === userId);
    if (memberIndex === -1) {
      throw new Error(`User ${userId} is not a member of team ${teamId}`);
    }
    
    // ユーザーをチームから削除
    teams[teamId].splice(memberIndex, 1);
    
    // チームのメンバー数を更新
    const teamIndex = mockGrafanaTeams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      mockGrafanaTeams[teamIndex].memberCount--;
    }
    
    return true;
  }
  
  try {
    if (!grafanaApi) {
      throw new Error('Grafana API client not initialized');
    }
    
    // Switch to the specific organization context first
    await grafanaApi.post(`/api/user/using/${orgId}`);
    
    await grafanaApi.delete(`/api/teams/${teamId}/members/${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to remove user ${userId} from team ${teamId}:`, error);
    throw error;
  }
}

// Synchronization 
export async function syncGrafanaOrgs(): Promise<number> {
  try {
    const grafanaOrgs = await getGrafanaOrgs();
    let count = 0;
    
    for (const grafanaOrg of grafanaOrgs) {
      // Check if organization exists in our DB
      const existingOrg = (await storage.getGrafanaOrganizations())
        .find(org => org.grafanaId === grafanaOrg.id);
      
      if (existingOrg) {
        // Update existing organization
        await storage.updateGrafanaOrganization(existingOrg.id, {
          name: grafanaOrg.name,
          grafanaId: grafanaOrg.id,
        });
      } else {
        // Create new organization
        await storage.createGrafanaOrganization({
          name: grafanaOrg.name,
          grafanaId: grafanaOrg.id,
        });
        count++;
      }
    }
    
    return count;
  } catch (error) {
    console.error('Failed to sync Grafana organizations:', error);
    throw error;
  }
}

export async function syncGrafanaUsers(): Promise<number> {
  try {
    const grafanaUsers = await getGrafanaUsers();
    let count = 0;
    
    for (const grafanaUser of grafanaUsers) {
      // Check if user exists in our DB
      const existingUser = (await storage.getGrafanaUsers())
        .find(user => user.grafanaId === grafanaUser.id);
      
      if (existingUser) {
        // Update existing user
        await storage.updateGrafanaUser(existingUser.id, {
          name: grafanaUser.name,
          email: grafanaUser.email,
          login: grafanaUser.login,
          lastLogin: grafanaUser.lastSeenAt ? new Date(grafanaUser.lastSeenAt) : null,
          status: 'active',
        });
      } else {
        // Create new user
        await storage.createGrafanaUser({
          userId: grafanaUser.login,
          name: grafanaUser.name,
          email: grafanaUser.email,
          login: grafanaUser.login,
          grafanaId: grafanaUser.id,
          lastLogin: grafanaUser.lastSeenAt ? new Date(grafanaUser.lastSeenAt) : null,
          status: 'active',
          company: null,
          department: null,
          position: null,
        });
        count++;
      }
    }
    
    return count;
  } catch (error) {
    console.error('Failed to sync Grafana users:', error);
    throw error;
  }
}

export async function syncGrafanaTeams(): Promise<number> {
  try {
    const organizations = await storage.getGrafanaOrganizations();
    let count = 0;
    
    for (const org of organizations) {
      if (!org.grafanaId) continue;
      
      const grafanaTeams = await getGrafanaTeams(org.grafanaId);
      
      for (const grafanaTeam of grafanaTeams) {
        // Check if team exists in our DB
        const existingTeam = (await storage.getGrafanaTeams(org.id))
          .find(team => team.grafanaId === grafanaTeam.id);
        
        if (existingTeam) {
          // Update existing team
          await storage.updateGrafanaTeam(existingTeam.id, {
            name: grafanaTeam.name,
            email: grafanaTeam.email,
          });
        } else {
          // Create new team
          await storage.createGrafanaTeam({
            name: grafanaTeam.name,
            orgId: org.id,
            grafanaId: grafanaTeam.id,
            email: grafanaTeam.email,
          });
          count++;
        }
      }
    }
    
    return count;
  } catch (error) {
    console.error('Failed to sync Grafana teams:', error);
    throw error;
  }
}

export async function runFullSync(): Promise<{
  orgs: number,
  users: number,
  teams: number
}> {
  const orgs = await syncGrafanaOrgs();
  const users = await syncGrafanaUsers();
  const teams = await syncGrafanaTeams();
  
  // Log successful sync
  await storage.createSyncLog({
    type: 'grafana_full_sync',
    status: 'success',
    details: { orgs, users, teams }
  });
  
  return { orgs, users, teams };
}
