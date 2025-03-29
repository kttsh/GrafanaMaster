import { ReactNode, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "./header";
import Sidebar from "./sidebar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface StatsResponse {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  disabledUsers: number;
  totalOrgs: number;
  totalTeams: number;
  lastSync?: {
    time: string;
    status: "success" | "error";
    type: string;
  };
}

interface Organization {
  id: number;
  name: string;
}

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * メインレイアウトコンポーネント
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const MainLayout = ({
  children,
  title,
  subtitle,
}: MainLayoutProps) => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Get statistics for the last sync info
  const { data: stats, isLoading: isStatsLoading } = useQuery<StatsResponse>({
    queryKey: ["/api/stats"],
    staleTime: 60000, // 1 minute
  });
  
  // Get organizations for the org selector
  const { data: organizations, isLoading: isOrgsLoading } = useQuery<Organization[]>({
    queryKey: ["/api/grafana/organizations"],
  });
  
  // Handle sync
  const syncMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      // First sync from Opoppo to local DB
      await apiRequest("POST", "/api/sync/opoppo");
      // Then sync from local DB to Grafana
      return await apiRequest("POST", "/api/sync/grafana");
    },
    onSuccess: () => {
      toast({
        title: "同期が完了しました",
        description: "ユーザーデータの同期が正常に完了しました。",
        className: cn(
          "bg-grafana-dark-200 border-grafana-green text-grafana-text"
        ),
      });
      // Invalidate queries that might have changed
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/logs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "同期に失敗しました",
        description: error.message,
        variant: "destructive",
        className: cn(
          "bg-grafana-dark-200 border-grafana-error text-grafana-text"
        ),
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });
  
  const handleSyncClick = () => {
    syncMutation.mutate();
  };

  const isLoading = isStatsLoading || isOrgsLoading;

  return (
    <div className="h-screen flex flex-col bg-grafana-dark">
      <Header 
        lastSyncTime={stats?.lastSync?.time}
        syncStatus={stats?.lastSync?.status === "success" ? "success" : stats?.lastSync ? "error" : "none"}
        orgs={organizations || []}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onSyncClick={handleSyncClick}
          isSyncing={isSyncing}
        />
        
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full grafana-scrollbar">
            <div className="p-4 md:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-8 w-8 animate-spin text-grafana-orange" />
                </div>
              ) : (
                <>
                  {(title || subtitle) && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-grafana-dark-100 pb-4">
                      <div>
                        {title && <h1 className="text-2xl font-semibold text-white mb-1">{title}</h1>}
                        {subtitle && <p className="text-grafana-text text-sm">{subtitle}</p>}
                      </div>
                    </div>
                  )}
                  
                  {children}
                </>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
