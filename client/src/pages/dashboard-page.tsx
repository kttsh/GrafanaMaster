import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import StatusCard from "@/components/ui/status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  User, 
  UserCheck, 
  Clock, 
  Building,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch sync logs
  const { data: syncLogs, isLoading: isLoadingSyncLogs } = useQuery({
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

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Overview of Grafana master management system"
    >
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard
          title="Total Users"
          value={isLoading ? "-" : stats?.totalUsers || 0}
          subtitle="All registered users"
          icon={<User />}
          color="blue"
        />
        <StatusCard
          title="Active Users"
          value={isLoading ? "-" : stats?.activeUsers || 0}
          subtitle={isLoading ? "" : `${Math.round((stats?.activeUsers / stats?.totalUsers || 0) * 100)}% of total users`}
          icon={<UserCheck />}
          color="green"
        />
        <StatusCard
          title="Pending Users"
          value={isLoading ? "-" : stats?.pendingUsers || 0}
          subtitle="Need activation"
          icon={<Clock />}
          color="yellow"
        />
        <StatusCard
          title="Organizations"
          value={isLoading ? "-" : stats?.organizations || 0}
          subtitle="Across companies"
          icon={<Building />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* User Distribution Chart */}
        <Card className="lg:col-span-2 bg-grafana-dark-100 border-grafana-dark-200">
          <CardHeader>
            <CardTitle className="text-white text-lg">User Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                      backgroundColor: '#22252B', 
                      border: '1px solid #464646',
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

        {/* Recent Sync Logs */}
        <Card className="bg-grafana-dark-100 border-grafana-dark-200">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recent Synchronizations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSyncLogs ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-grafana-dark-200" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-grafana-dark-200" />
                      <Skeleton className="h-3 w-24 bg-grafana-dark-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : syncLogs?.length > 0 ? (
              <div className="space-y-4">
                {syncLogs.map((log) => (
                  <div key={log.id} className="flex items-start border-b border-grafana-dark-200 pb-3 last:border-0">
                    <div className={`p-2 rounded-full mr-3 ${log.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {log.status === 'success' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {log.type === 'opoppo_to_db' ? 'Opoppo Sync' : 
                         log.type === 'grafana_full_sync' ? 'Grafana Sync' : 
                         log.type === 'db_to_grafana' ? 'Database to Grafana' : 
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
              <p className="text-grafana-text text-center py-6">No synchronization logs found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Teams Overview */}
      <Card className="bg-grafana-dark-100 border-grafana-dark-200">
        <CardHeader>
          <CardTitle className="text-white text-lg">Teams Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto grafana-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-grafana-dark-200">
                  <th className="px-4 py-3 text-grafana-text font-medium text-sm">Team</th>
                  <th className="px-4 py-3 text-grafana-text font-medium text-sm">Organization</th>
                  <th className="px-4 py-3 text-grafana-text font-medium text-sm">Members</th>
                  <th className="px-4 py-3 text-grafana-text font-medium text-sm">Email</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {id: 1, name: 'DevOps', org: 'Engineering', members: 8, email: 'devops@example.com'},
                  {id: 2, name: 'Frontend', org: 'Development', members: 12, email: 'frontend@example.com'},
                  {id: 3, name: 'Design', org: 'Marketing', members: 6, email: 'design@example.com'},
                  {id: 4, name: 'Data Analytics', org: 'Finance', members: 4, email: 'analytics@example.com'},
                ].map((team) => (
                  <tr key={team.id} className="border-b border-grafana-dark-200 hover:bg-grafana-dark-200/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-2">
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
}
