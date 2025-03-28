import { ReactNode, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "./header";
import Sidebar from "./sidebar";
import { useToast } from "@/hooks/use-toast";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function MainLayout({
  children,
  title,
  subtitle,
}: MainLayoutProps) {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Get statistics for the last sync info
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    staleTime: 60000, // 1 minute
  });
  
  // Get organizations for the org selector
  const { data: organizations } = useQuery({
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
        title: "Synchronization completed",
        description: "Users have been synchronized successfully.",
      });
      // Invalidate queries that might have changed
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/logs"] });
    },
    onError: (error) => {
      toast({
        title: "Synchronization failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });
  
  const handleSyncClick = () => {
    syncMutation.mutate();
  };

  return (
    <div className="h-screen flex flex-col bg-grafana-black">
      <Header 
        lastSyncTime={stats?.lastSync?.time}
        syncStatus={stats?.lastSync?.status === "success" ? "success" : stats?.lastSync ? "error" : "none"}
        orgs={organizations}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onSyncClick={handleSyncClick}
          isSyncing={isSyncing}
        />
        
        <main className="flex-1 overflow-auto grafana-scrollbar">
          <div className="p-4 md:p-6">
            {(title || subtitle) && (
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  {title && <h1 className="text-2xl font-semibold text-white mb-1">{title}</h1>}
                  {subtitle && <p className="text-grafana-text">{subtitle}</p>}
                </div>
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
