import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import StatusCard from "@/components/ui/status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  UserCheck, 
  Clock, 
  Building,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SyncLog {
  id: number;
  type: string;
  status: string;
  details?: any;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  disabledUsers: number;
  totalOrgs: number;
  totalTeams: number;
}

/**
 * ダッシュボードページコンポーネント
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const DashboardPage = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch sync logs
  const { data: syncLogs, isLoading: isLoadingSyncLogs } = useQuery<SyncLog[]>({
    queryKey: ["/api/sync/logs"],
    queryFn: async () => {
      const res = await fetch("/api/sync/logs?limit=5");
      if (!res.ok) throw new Error("Failed to fetch sync logs");
      return res.json();
    },
  });

  // Sample data for the chart
  const chartData = [
    { name: 'Marketing', users: 36, orgs: 2 },
    { name: 'Engineering', users: 42, orgs: 3 },
    { name: 'Sales', users: 28, orgs: 1 },
    { name: 'Finance', users: 20, orgs: 1 },
    { name: 'HR', users: 16, orgs: 1 },
  ];

  // 統計データが利用可能な場合にのみ割合を計算
  const calculatePercentage = (): string => {
    if (!stats || stats.totalUsers === 0) return "";
    const percentage = Math.round((stats.activeUsers / stats.totalUsers) * 100);
    return `全体の${percentage}%`;
  };

  return (
    <MainLayout
      title="ダッシュボード"
      subtitle="Grafanaマスター管理システムの概要"
    >
      {/* ステータスカード */}
      <div className="status-card-grid mb-6">
        <StatusCard
          title="ユーザー総数"
          value={isLoading ? "-" : stats?.totalUsers || 0}
          subtitle="登録ユーザー全体"
          icon={<User className="h-6 w-6" />}
          color="blue"
        />
        <StatusCard
          title="アクティブユーザー"
          value={isLoading ? "-" : stats?.activeUsers || 0}
          subtitle={isLoading ? "" : calculatePercentage()}
          icon={<UserCheck className="h-6 w-6" />}
          color="green"
        />
        <StatusCard
          title="保留中ユーザー"
          value={isLoading ? "-" : stats?.pendingUsers || 0}
          subtitle="アクティベーション待ち"
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        <StatusCard
          title="組織"
          value={isLoading ? "-" : stats?.totalOrgs || 0}
          subtitle="会社全体"
          icon={<Building className="h-6 w-6" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* ユーザー分布チャート */}
        <Card className="lg:col-span-2 bg-grafana-dark-200 border-grafana-dark-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg font-medium">部門別ユーザー分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#D8D9DA" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#464646' }}
                  />
                  <YAxis 
                    stroke="#D8D9DA" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#464646' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#181B1F', 
                      border: '1px solid #2c3235',
                      borderRadius: '4px',
                      color: '#D8D9DA'
                    }}
                  />
                  <Bar dataKey="users" fill="#F46800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 最近の同期ログ */}
        <Card className="bg-grafana-dark-200 border-grafana-dark-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg font-medium">最近の同期</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSyncLogs ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-grafana-dark-100" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-grafana-dark-100" />
                      <Skeleton className="h-3 w-24 bg-grafana-dark-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : syncLogs && syncLogs.length > 0 ? (
              <div className="space-y-4">
                {syncLogs.map((log: SyncLog) => (
                  <div key={log.id} className="flex items-start border-b border-grafana-dark-100 pb-3 last:border-0">
                    <div className={cn(
                      "p-2 rounded-full mr-3",
                      log.status === 'success' 
                        ? "bg-grafana-green/20 text-grafana-green" 
                        : "bg-grafana-error/20 text-grafana-error"
                    )}>
                      {log.status === 'success' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {log.type === 'opoppo_to_db' ? 'Opoppo同期' : 
                         log.type === 'grafana_full_sync' ? 'Grafana全体同期' : 
                         log.type === 'db_to_grafana' ? 'DB→Grafana同期' : 
                         log.type === 'grafana_users_sync' ? 'ユーザー同期' :
                         log.type === 'grafana_orgs_sync' ? '組織同期' :
                         log.type === 'grafana_teams_sync' ? 'チーム同期' :
                         log.type}
                      </p>
                      <p className="text-xs text-grafana-text">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-grafana-text text-center py-6">同期ログが見つかりません</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* チーム概要 */}
      <Card className="bg-grafana-dark-200 border-grafana-dark-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg font-medium">チーム概要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto grafana-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-grafana-dark-100">
                  <th className="px-4 py-3 text-grafana-text font-medium text-sm">チーム</th>
                  <th className="px-4 py-3 text-grafana-text font-medium text-sm">組織</th>
                  <th className="px-4 py-3 text-grafana-text font-medium text-sm">メンバー数</th>
                  <th className="px-4 py-3 text-grafana-text font-medium text-sm">メールアドレス</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {id: 1, name: 'DevOps', org: 'Engineering', members: 8, email: 'devops@example.com'},
                  {id: 2, name: 'Frontend', org: 'Development', members: 12, email: 'frontend@example.com'},
                  {id: 3, name: 'Design', org: 'Marketing', members: 6, email: 'design@example.com'},
                  {id: 4, name: 'Data Analytics', org: 'Finance', members: 4, email: 'analytics@example.com'},
                ].map((team) => (
                  <tr key={team.id} className="border-b border-grafana-dark-100 hover:bg-grafana-dark-100/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-grafana-orange/20 flex items-center justify-center text-grafana-orange mr-2">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="text-white font-medium">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-grafana-text">{team.org}</td>
                    <td className="px-4 py-3 text-grafana-text">{team.members}</td>
                    <td className="px-4 py-3 text-grafana-text">{team.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default DashboardPage;
