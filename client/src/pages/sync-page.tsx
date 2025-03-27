import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle, 
  XCircle,
  Clock,
  Database,
  Server
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function SyncPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("logs");
  const [syncing, setSyncing] = useState<string | null>(null);
  
  // Fetch sync logs
  const { data: syncLogs, isLoading } = useQuery({
    queryKey: ["/api/sync/logs"],
    queryFn: async () => {
      const res = await fetch("/api/sync/logs?limit=20");
      if (!res.ok) throw new Error("Failed to fetch sync logs");
      return res.json();
    },
  });

  // Fetch Opoppo users for the users tab
  const { data: opoppoUsers, isLoading: isLoadingOopoppoUsers } = useQuery({
    queryKey: ["/api/opoppo/users"],
    queryFn: async () => {
      const res = await fetch("/api/opoppo/users");
      if (!res.ok) throw new Error("Failed to fetch Opoppo users");
      return res.json();
    },
    enabled: activeTab === "users",
  });

  // Sync Opoppo to DB mutation
  const syncOPoppoMutation = useMutation({
    mutationFn: async () => {
      setSyncing("opoppo");
      const res = await apiRequest("POST", "/api/sync/opoppo");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Opoppo synchronization completed",
        description: `Added ${data.count} new users.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Synchronization failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSyncing(null);
    },
  });

  // Sync DB to Grafana mutation
  const syncGrafanaMutation = useMutation({
    mutationFn: async () => {
      setSyncing("grafana");
      const res = await apiRequest("POST", "/api/sync/grafana");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Grafana synchronization completed",
        description: `Synced ${data.orgs} orgs, ${data.users} users, and ${data.teams} teams.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Synchronization failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSyncing(null);
    },
  });

  // Full sync (both)
  const handleFullSync = async () => {
    try {
      setSyncing("full");
      // First sync from Opoppo to local DB
      await syncOPoppoMutation.mutateAsync();
      // Then sync from local DB to Grafana
      await syncGrafanaMutation.mutateAsync();
      
      toast({
        title: "Full synchronization completed",
        description: "All systems have been synchronized successfully.",
      });
    } catch (error) {
      // Errors are already handled by individual mutations
    } finally {
      setSyncing(null);
    }
  };

  return (
    <MainLayout
      title="Synchronization"
      subtitle="Synchronize users between Opoppo and Grafana"
    >
      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          onClick={() => syncOPoppoMutation.mutate()}
          disabled={syncing !== null}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Database className={`mr-2 h-4 w-4 ${syncing === "opoppo" ? "animate-spin" : ""}`} />
          <span>Sync Opoppo to DB</span>
        </Button>
        
        <Button
          onClick={() => syncGrafanaMutation.mutate()}
          disabled={syncing !== null}
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Server className={`mr-2 h-4 w-4 ${syncing === "grafana" ? "animate-spin" : ""}`} />
          <span>Sync DB to Grafana</span>
        </Button>
        
        <Button
          onClick={handleFullSync}
          disabled={syncing !== null}
          className="flex items-center bg-grafana-teal hover:bg-grafana-teal/90 text-grafana-dark font-medium"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing === "full" ? "animate-spin" : ""}`} />
          <span>Full Sync</span>
        </Button>
      </div>

      {/* Sync Status */}
      {syncing && (
        <Card className="bg-grafana-dark-100 border-grafana-dark-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-grafana-orange mr-2" />
                <span className="text-white font-medium">
                  {syncing === "opoppo" && "Syncing Opoppo to Database..."}
                  {syncing === "grafana" && "Syncing Database to Grafana..."}
                  {syncing === "full" && "Running full synchronization..."}
                </span>
              </div>
              <span className="text-grafana-text text-sm">Please wait</span>
            </div>
            <Progress className="h-2 bg-grafana-dark-200" value={undefined} />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-grafana-dark-100 border-grafana-dark-200">
          <TabsTrigger value="logs" className="data-[state=active]:bg-grafana-dark-200">
            Synchronization Logs
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-grafana-dark-200">
            Opoppo Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="pt-4">
          <Card className="bg-grafana-dark-100 border-grafana-dark-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto grafana-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-grafana-dark-200">
                      <TableHead className="text-grafana-text font-medium text-sm">Type</TableHead>
                      <TableHead className="text-grafana-text font-medium text-sm">Status</TableHead>
                      <TableHead className="text-grafana-text font-medium text-sm">Time</TableHead>
                      <TableHead className="text-grafana-text font-medium text-sm">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeletons
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-grafana-dark-200">
                          <TableCell><Skeleton className="h-4 w-32 bg-grafana-dark-200" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 bg-grafana-dark-200" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 bg-grafana-dark-200" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40 bg-grafana-dark-200" /></TableCell>
                        </TableRow>
                      ))
                    ) : syncLogs?.length > 0 ? (
                      // Display logs
                      syncLogs.map((log) => (
                        <TableRow key={log.id} className="border-b border-grafana-dark-200 hover:bg-grafana-dark-200/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center">
                              {log.type === 'opoppo_to_db' ? (
                                <div className="flex items-center">
                                  <div className="p-1 rounded-full bg-blue-500/20 text-blue-400 mr-2">
                                    <Database className="h-4 w-4" />
                                  </div>
                                  <span className="text-white">Opoppo to DB</span>
                                </div>
                              ) : log.type === 'grafana_full_sync' ? (
                                <div className="flex items-center">
                                  <div className="p-1 rounded-full bg-purple-500/20 text-purple-400 mr-2">
                                    <Server className="h-4 w-4" />
                                  </div>
                                  <span className="text-white">Grafana Full Sync</span>
                                </div>
                              ) : log.type === 'db_to_grafana' ? (
                                <div className="flex items-center">
                                  <div className="p-1 rounded-full bg-green-500/20 text-green-400 mr-2">
                                    <Server className="h-4 w-4" />
                                  </div>
                                  <span className="text-white">DB to Grafana</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <div className="p-1 rounded-full bg-gray-500/20 text-gray-400 mr-2">
                                    <RefreshCw className="h-4 w-4" />
                                  </div>
                                  <span className="text-white">{log.type}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.status === 'success' ? (
                              <div className="flex items-center">
                                <div className="p-1 rounded-full bg-grafana-success/20 text-grafana-success">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                                <span className="ml-2 text-grafana-success">Success</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="p-1 rounded-full bg-grafana-error/20 text-grafana-error">
                                  <XCircle className="h-4 w-4" />
                                </div>
                                <span className="ml-2 text-grafana-error">Error</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-grafana-text">
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell className="text-grafana-text">
                            {log.details ? (
                              <div>
                                {log.details.added && <span>Added: {log.details.added}</span>}
                                {log.details.total && <span> Total: {log.details.total}</span>}
                                {log.details.orgs && <span> Orgs: {log.details.orgs}</span>}
                                {log.details.users && <span> Users: {log.details.users}</span>}
                                {log.details.teams && <span> Teams: {log.details.teams}</span>}
                                {log.details.error && <span className="text-grafana-error">{log.details.error}</span>}
                              </div>
                            ) : (
                              <span>No details</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-grafana-text">
                          No synchronization logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="pt-4">
          <Card className="bg-grafana-dark-100 border-grafana-dark-200">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Opoppo User Repository
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto grafana-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-grafana-dark-200">
                      <TableHead className="text-grafana-text font-medium text-sm">User ID</TableHead>
                      <TableHead className="text-grafana-text font-medium text-sm">Name</TableHead>
                      <TableHead className="text-grafana-text font-medium text-sm">Company</TableHead>
                      <TableHead className="text-grafana-text font-medium text-sm">Department</TableHead>
                      <TableHead className="text-grafana-text font-medium text-sm">Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingOopoppoUsers ? (
                      // Loading skeletons
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-grafana-dark-200">
                          <TableCell><Skeleton className="h-4 w-20 bg-grafana-dark-200" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32 bg-grafana-dark-200" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 bg-grafana-dark-200" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 bg-grafana-dark-200" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 bg-grafana-dark-200" /></TableCell>
                        </TableRow>
                      ))
                    ) : opoppoUsers?.length > 0 ? (
                      // Display Opoppo users
                      opoppoUsers.slice(0, 15).map((user) => (
                        <TableRow key={user.USER_ID} className="border-b border-grafana-dark-200 hover:bg-grafana-dark-200/50 transition-colors">
                          <TableCell className="text-white font-medium">{user.USER_ID}</TableCell>
                          <TableCell className="text-grafana-text">{`${user.SEI} ${user.MEI}`}</TableCell>
                          <TableCell className="text-grafana-text">{user.KAISYA_NM || user.KAISYA_CD}</TableCell>
                          <TableCell className="text-grafana-text">{user.SOSHIKI_NM || '-'}</TableCell>
                          <TableCell className="text-grafana-text">{user.YAKUSYOKU_NM || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-grafana-text">
                          No Opoppo users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {opoppoUsers?.length > 15 && (
                <div className="p-4 text-center text-grafana-text border-t border-grafana-dark-200">
                  Showing 15 of {opoppoUsers.length} users
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
