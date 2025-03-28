import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import UserTable from "@/components/ui/user-table";
import AddUserDialog from "@/components/dialogs/add-user-dialog";
import EditUserDialog from "@/components/dialogs/edit-user-dialog";
import StatusCard from "@/components/ui/status-card";
import { 
  User, 
  UserCheck, 
  Clock, 
  Building,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { toast } = useToast();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch statistics
  interface StatsData {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    organizations: number;
    teams: number;
    lastSync: {
      time: string;
      type: string;
      status: string;
    } | null;
  }
  
  const { data: stats, isLoading: isLoadingStats } = useQuery<StatsData, Error>({
    queryKey: ["/api/stats"],
  });

  // Sync users from Grafana mutation
  const syncGrafanaUsersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sync/grafana-users");
      return await response.json();
    },
    onSuccess: (data: { count: number, status: string }) => {
      toast({
        title: "同期完了",
        description: `Grafanaからのユーザー同期が完了しました。${data.count || 0}ユーザーを同期しました。`,
      });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/logs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "同期エラー",
        description: `Grafanaからのユーザー同期に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle user deletion
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/grafana/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (userId: number) => {
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
      setDeleteUserId(null);
    }
  };

  const handleEditUser = (userId: number) => {
    setEditUserId(userId);
    setIsEditUserOpen(true);
  };

  return (
    <MainLayout
      title="User Management"
      subtitle="Manage Grafana users and integrate with Opoppo user repository"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-10 pr-3 py-2 bg-grafana-dark-100 border border-grafana-dark-200 rounded-md text-grafana-text placeholder-grafana-gray focus:outline-none focus:ring-1 focus:ring-grafana-orange"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-grafana-gray" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => syncGrafanaUsersMutation.mutate()}
            disabled={syncGrafanaUsersMutation.isPending}
            className="flex items-center justify-center px-4 py-2 bg-grafana-blue hover:bg-grafana-blue/90 text-white rounded-md transition-colors"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncGrafanaUsersMutation.isPending ? "animate-spin" : ""}`} />
            <span>Grafanaからユーザーを同期</span>
          </Button>
          
          <Button 
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center justify-center px-4 py-2 bg-grafana-orange hover:bg-grafana-orange/90 text-white rounded-md transition-colors"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard
          title="Total Users"
          value={isLoadingStats ? "-" : stats?.totalUsers || 0}
          subtitle="All registered users"
          icon={<User />}
          color="blue"
        />
        <StatusCard
          title="Active Users"
          value={isLoadingStats ? "-" : stats?.activeUsers || 0}
          subtitle={isLoadingStats ? "" : `${Math.round(((stats?.activeUsers ?? 0) / (stats?.totalUsers ?? 1)) * 100)}% of total users`}
          icon={<UserCheck />}
          color="green"
        />
        <StatusCard
          title="Pending Users"
          value={isLoadingStats ? "-" : stats?.pendingUsers || 0}
          subtitle="Need activation"
          icon={<Clock />}
          color="yellow"
        />
        <StatusCard
          title="Organizations"
          value={isLoadingStats ? "-" : stats?.organizations || 0}
          subtitle="Across companies"
          icon={<Building />}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-grafana-dark-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b-0">
            <TabsTrigger 
              value="all" 
              className="px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-grafana-orange data-[state=active]:text-white text-grafana-text font-medium data-[state=active]:shadow-none bg-transparent"
            >
              All Users
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-grafana-orange data-[state=active]:text-white text-grafana-text font-medium data-[state=active]:shadow-none bg-transparent"
            >
              Admins
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-grafana-orange data-[state=active]:text-white text-grafana-text font-medium data-[state=active]:shadow-none bg-transparent"
            >
              Pending
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* User Table */}
      <UserTable
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Add User Dialog */}
      <AddUserDialog 
        isOpen={isAddUserOpen} 
        onClose={() => setIsAddUserOpen(false)} 
      />

      {/* Edit User Dialog */}
      {editUserId && (
        <EditUserDialog
          isOpen={isEditUserOpen}
          onClose={() => {
            setIsEditUserOpen(false);
            setEditUserId(null);
          }}
          userId={editUserId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm User Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-grafana-dark border-grafana-dark-200 text-grafana-text hover:bg-grafana-dark-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-grafana-error hover:bg-grafana-error/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
