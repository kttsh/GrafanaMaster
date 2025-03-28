import {
  User,
  GrafanaUser,
  GrafanaOrganization,
  GrafanaTeam,
  UserOrgMembership,
  UserTeamMembership,
  SyncLog,
  Setting
} from '@prisma/client';

// 認証関連
export type { User };
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'isAdmin'>;

// Grafana ユーザー関連
export type { GrafanaUser };
export type InsertGrafanaUser = Omit<GrafanaUser, 'id' | 'createdAt' | 'updatedAt'>;

// Grafana 組織関連
export type { GrafanaOrganization };
export type InsertGrafanaOrg = Omit<GrafanaOrganization, 'id' | 'createdAt' | 'updatedAt'>;

// Grafana チーム関連
export type { GrafanaTeam };
export type InsertGrafanaTeam = Omit<GrafanaTeam, 'id' | 'createdAt' | 'updatedAt'>;

// ユーザー組織メンバーシップ関連
export type { UserOrgMembership };
export type InsertUserOrgMembership = Omit<UserOrgMembership, 'id' | 'createdAt'>;

// ユーザーチームメンバーシップ関連
export type { UserTeamMembership };
export type InsertUserTeamMembership = Omit<UserTeamMembership, 'id' | 'createdAt'>;

// 同期ログ関連
export type { SyncLog };
export interface InsertSyncLog {
  type: string;
  status: string;
  details?: any;
}

// 設定関連
export type { Setting };
export type InsertSetting = Omit<Setting, 'id' | 'updatedAt'>;

// Opoppo関連の型
export interface OPoppoUser {
  USER_ID: string;
  SEI: string;
  MEI: string;
  YAKUSYOKU_CD: string;
  KAISYA_CD: string;
  SOSHIKI_CD: string;
  YAKUSYOKU_NM?: string;
  SOSHIKI_NM?: string;
  KAISYA_NM?: string;
}