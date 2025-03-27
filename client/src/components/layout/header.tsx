import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, LogOut, AlertTriangle, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface HeaderProps {
  selectedOrg?: string;
  orgs?: { id: number; name: string }[];
  onOrgChange?: (orgId: number) => void;
  lastSyncTime?: string | Date;
  syncStatus?: "success" | "error" | "none";
}

export default function Header({
  selectedOrg = "Acme Corporation",
  orgs = [],
  onOrgChange,
  lastSyncTime,
  syncStatus = "none",
}: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-grafana-dark border-b border-grafana-dark-100 px-4 flex items-center justify-between h-14">
      <div className="flex items-center">
        {/* Logo */}
        <div className="flex items-center mr-4">
          <img src="https://grafana.com/static/assets/img/grafana_icon.svg" alt="Grafana Logo" className="h-8 w-8" />
          <span className="text-white font-semibold ml-2 text-lg hidden md:inline-block">Grafana Master Management</span>
        </div>
        
        {/* Organization Selector */}
        {orgs.length > 0 && (
          <div className="relative hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3 py-1 rounded hover:bg-grafana-dark-100 transition-colors">
                  <span className="text-grafana-text">{selectedOrg}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-grafana-text">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
                <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-grafana-dark-200" />
                {orgs.map((org) => (
                  <DropdownMenuItem 
                    key={org.id}
                    onClick={() => onOrgChange?.(org.id)}
                    className={cn(
                      "cursor-pointer hover:bg-grafana-dark-200 hover:text-white",
                      org.name === selectedOrg && "text-grafana-orange font-medium"
                    )}
                  >
                    {org.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Sync Status */}
        {syncStatus !== "none" && (
          <div className={cn(
            "hidden md:flex items-center text-sm mr-2",
            syncStatus === "success" ? "text-grafana-success" : "text-grafana-error"
          )}>
            {syncStatus === "success" ? (
              <CheckCircle className="mr-1 h-4 w-4" />
            ) : (
              <AlertTriangle className="mr-1 h-4 w-4" />
            )}
            <span>Last sync: {formatDate(lastSyncTime)}</span>
          </div>
        )}
        
        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-grafana-dark-100 transition-colors">
                <div className="w-8 h-8 bg-grafana-dark-100 rounded-full flex items-center justify-center text-white">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden md:inline-block text-grafana-text">{user.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-grafana-dark-200" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer hover:bg-grafana-dark-200 hover:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

import { cn } from "@/lib/utils";
