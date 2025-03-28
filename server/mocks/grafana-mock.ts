/**
 * Grafana APIレスポンスのモックデータ
 */

// モックデータの型定義
interface GrafanaOrgMock {
  id: number;
  name: string;
  address: {
    city: string;
    country: string;
    state: string;
    address1: string;
    address2: string;
    zipCode: string;
  };
}

interface GrafanaUserMock {
  id: number;
  email: string;
  name: string;
  login: string;
  role: string;
  isDisabled: boolean;
  isExternal: boolean;
  authLabels: string[];
  lastSeenAt: string;
  lastSeenAtAge: string;
}

interface GrafanaTeamMock {
  id: number;
  name: string;
  email: string;
  orgId: number;
  memberCount: number;
}

interface GrafanaTeamMemberMock {
  userId: number;
  name: string;
  email: string;
  login: string;
  avatarUrl: string;
  labels: string[];
}

interface GrafanaOrgMembershipMock {
  orgId: number;
  role: string;
}

// インデックスシグネチャを持つ型を定義
interface TeamMembersMap {
  [teamId: number]: GrafanaTeamMemberMock[];
}

interface UserOrgMembershipsMap {
  [userId: number]: GrafanaOrgMembershipMock[];
}

// Grafana組織のモックデータ
export const mockGrafanaOrgs: GrafanaOrgMock[] = [
  {
    id: 1,
    name: "本社",
    address: {
      city: "Tokyo",
      country: "Japan",
      state: "",
      address1: "1-1-1 Chiyoda",
      address2: "",
      zipCode: "100-0001"
    }
  },
  {
    id: 2,
    name: "支社",
    address: {
      city: "Osaka",
      country: "Japan",
      state: "",
      address1: "2-2-2 Umeda",
      address2: "",
      zipCode: "530-0001"
    }
  },
  {
    id: 3,
    name: "子会社",
    address: {
      city: "Nagoya",
      country: "Japan", 
      state: "",
      address1: "3-3-3 Sakae",
      address2: "",
      zipCode: "460-0008"
    }
  }
];

// Grafanaユーザーのモックデータ
export const mockGrafanaUsers: GrafanaUserMock[] = [
  {
    id: 1,
    email: "yamada.taro@example.com",
    name: "山田 太郎",
    login: "yamada.taro",
    role: "Admin",
    isDisabled: false,
    isExternal: false,
    authLabels: ["LDAP"],
    lastSeenAt: "2023-05-01T09:00:00Z",
    lastSeenAtAge: "1 day"
  },
  {
    id: 2,
    email: "sato.hanako@example.com",
    name: "佐藤 花子",
    login: "sato.hanako",
    role: "Editor",
    isDisabled: false,
    isExternal: false,
    authLabels: ["LDAP"],
    lastSeenAt: "2023-05-02T10:30:00Z",
    lastSeenAtAge: "2 hours"
  },
  {
    id: 3,
    email: "suzuki.ichiro@example.com",
    name: "鈴木 一郎",
    login: "suzuki.ichiro",
    role: "Viewer",
    isDisabled: false,
    isExternal: true,
    authLabels: ["LDAP"],
    lastSeenAt: "2023-04-28T15:45:00Z",
    lastSeenAtAge: "4 days"
  },
  {
    id: 4,
    email: "tanaka.hiroshi@example.com",
    name: "田中 浩",
    login: "tanaka.hiroshi",
    role: "Admin",
    isDisabled: false,
    isExternal: false,
    authLabels: ["LDAP"],
    lastSeenAt: "2023-05-03T08:15:00Z",
    lastSeenAtAge: "1 hour"
  },
  {
    id: 5,
    email: "takahashi.akira@example.com",
    name: "高橋 明",
    login: "takahashi.akira",
    role: "Viewer",
    isDisabled: true,
    isExternal: false,
    authLabels: ["LDAP"],
    lastSeenAt: "2023-03-15T11:20:00Z",
    lastSeenAtAge: "1 month"
  }
];

// Grafanaチームのモックデータ
export const mockGrafanaTeams: GrafanaTeamMock[] = [
  {
    id: 1,
    name: "営業チーム",
    email: "sales@example.com",
    orgId: 1,
    memberCount: 2
  },
  {
    id: 2,
    name: "技術チーム",
    email: "tech@example.com",
    orgId: 1,
    memberCount: 2
  },
  {
    id: 3,
    name: "管理チーム",
    email: "admin@example.com",
    orgId: 2,
    memberCount: 1
  }
];

// チームメンバーのモックデータ
export const mockTeamMembers: TeamMembersMap = {
  1: [ // 営業チームのメンバー
    {
      userId: 1,
      name: "山田 太郎",
      email: "yamada.taro@example.com",
      login: "yamada.taro",
      avatarUrl: "/avatar/1",
      labels: []
    },
    {
      userId: 2,
      name: "佐藤 花子",
      email: "sato.hanako@example.com",
      login: "sato.hanako",
      avatarUrl: "/avatar/2",
      labels: []
    }
  ],
  2: [ // 技術チームのメンバー
    {
      userId: 3,
      name: "鈴木 一郎",
      email: "suzuki.ichiro@example.com",
      login: "suzuki.ichiro",
      avatarUrl: "/avatar/3",
      labels: []
    },
    {
      userId: 4,
      name: "田中 浩",
      email: "tanaka.hiroshi@example.com",
      login: "tanaka.hiroshi",
      avatarUrl: "/avatar/4",
      labels: []
    }
  ],
  3: [ // 管理チームのメンバー
    {
      userId: 5,
      name: "高橋 明",
      email: "takahashi.akira@example.com",
      login: "takahashi.akira",
      avatarUrl: "/avatar/5",
      labels: []
    }
  ]
};

// ユーザーの組織メンバーシップのモックデータ
export const mockUserOrgMemberships: UserOrgMembershipsMap = {
  1: [ // 山田太郎の所属組織
    { orgId: 1, role: "Admin" }
  ],
  2: [ // 佐藤花子の所属組織
    { orgId: 1, role: "Editor" }
  ],
  3: [ // 鈴木一郎の所属組織
    { orgId: 1, role: "Viewer" }
  ],
  4: [ // 田中浩の所属組織
    { orgId: 1, role: "Admin" },
    { orgId: 2, role: "Viewer" }
  ],
  5: [ // 高橋明の所属組織
    { orgId: 2, role: "Admin" }
  ]
};