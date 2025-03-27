import axios from "axios";
import { storage } from "./storage";
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

// API client with basic auth
const grafanaApi = axios.create({
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

// Organization API
export async function getGrafanaOrgs(): Promise<any[]> {
  try {
    const response = await grafanaApi.get('/api/orgs');
    return response.data;
  } catch (error) {
    console.error('Failed to get Grafana organizations:', error);
    return [];
  }
}

export async function getGrafanaOrgById(orgId: number): Promise<any> {
  try {
    const response = await grafanaApi.get(`/api/orgs/${orgId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get Grafana organization with ID ${orgId}:`, error);
    throw error;
  }
}

export async function createGrafanaOrg(name: string): Promise<any> {
  try {
    const response = await grafanaApi.post('/api/orgs', { name });
    return response.data;
  } catch (error) {
    console.error('Failed to create Grafana organization:', error);
    throw error;
  }
}

export async function updateGrafanaOrg(orgId: number, name: string): Promise<any> {
  try {
    const response = await grafanaApi.put(`/api/orgs/${orgId}`, { name });
    return response.data;
  } catch (error) {
    console.error(`Failed to update Grafana organization with ID ${orgId}:`, error);
    throw error;
  }
}

export async function deleteGrafanaOrg(orgId: number): Promise<boolean> {
  try {
    await grafanaApi.delete(`/api/orgs/${orgId}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete Grafana organization with ID ${orgId}:`, error);
    throw error;
  }
}

// User API
export async function getGrafanaUsers(): Promise<any[]> {
  try {
    const response = await grafanaApi.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Failed to get Grafana users:', error);
    return [];
  }
}

export async function getGrafanaUserById(userId: number): Promise<any> {
  try {
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
  try {
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
  try {
    const response = await grafanaApi.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update Grafana user with ID ${userId}:`, error);
    throw error;
  }
}

export async function deleteGrafanaUser(userId: number): Promise<boolean> {
  try {
    await grafanaApi.delete(`/api/admin/users/${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete Grafana user with ID ${userId}:`, error);
    throw error;
  }
}

// User organization membership
export async function addUserToOrg(orgId: number, userId: number, role: string = 'Viewer'): Promise<any> {
  try {
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
  try {
    const response = await grafanaApi.patch(`/api/orgs/${orgId}/users/${userId}`, { role });
    return response.data;
  } catch (error) {
    console.error(`Failed to update role for user ${userId} in organization ${orgId}:`, error);
    throw error;
  }
}

export async function removeUserFromOrg(orgId: number, userId: number): Promise<boolean> {
  try {
    await grafanaApi.delete(`/api/orgs/${orgId}/users/${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to remove user ${userId} from organization ${orgId}:`, error);
    throw error;
  }
}

// Team API
export async function getGrafanaTeams(orgId: number): Promise<any[]> {
  try {
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
  try {
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
  try {
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
  try {
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
  try {
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
  try {
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
  try {
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
  try {
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
