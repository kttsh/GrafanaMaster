import { z } from "zod";

// Authentication
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().optional(),
  role: z.string()
});


// Grafana entities
export const grafanaUserSchema = z.object({
  id: z.number(),
  userId: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  status: z.string()
});

export const grafanaOrgSchema = z.object({
  id: z.number(),
  name: z.string(),
  grafanaId: z.number().optional()
});

export const grafanaTeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  orgId: z.number()
});


// Export types
export type User = z.infer<typeof userSchema>;
export type GrafanaUser = z.infer<typeof grafanaUserSchema>;
export type GrafanaOrganization = z.infer<typeof grafanaOrgSchema>;
export type GrafanaTeam = z.infer<typeof grafanaTeamSchema>;