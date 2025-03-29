import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle, 
  LogOut, 
  AlertTriangle, 
  User, 
  ChevronDown,
  Clock 
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface HeaderProps {
  selectedOrg?: string;
  orgs?: { id: number; name: string }[];
  onOrgChange?: (orgId: number) => void;
  lastSyncTime?: string | Date;
  syncStatus?: "success" | "error" | "none";
}

/**
 * ヘッダーコンポーネント
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const Header = ({
  selectedOrg = "Acme Corporation",
  orgs = [],
  onOrgChange,
  lastSyncTime,
  syncStatus = "none",
}: HeaderProps) => {
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
        {orgs && orgs.length > 0 && (
          <div className="relative hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 bg-grafana-dark-200 border-grafana-dark-100 text-grafana-text hover:bg-grafana-dark-100 hover:text-white">
                  <span className="mr-1">{selectedOrg}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-grafana-dark-200 border-grafana-dark-100 text-grafana-text">
                <DropdownMenuLabel>組織の切り替え</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-grafana-dark-100" />
                {orgs.map((org) => (
                  <DropdownMenuItem 
                    key={org.id}
                    onClick={() => onOrgChange?.(org.id)}
                    className={cn(
                      "cursor-pointer hover:bg-grafana-dark-100 hover:text-white",
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

      <div className="flex items-center space-x-3">
        {/* Sync Status */}
        {syncStatus !== "none" && lastSyncTime && (
          <Badge variant="outline" className={cn(
            "hidden md:flex items-center gap-1 px-2 py-1 h-8 border",
            syncStatus === "success" 
              ? "text-grafana-green border-grafana-green/30 bg-grafana-green/10" 
              : "text-grafana-error border-grafana-error/30 bg-grafana-error/10"
          )}>
            {syncStatus === "success" ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            <Clock className="h-3.5 w-3.5 mx-0.5" />
            <span className="text-xs font-medium">{formatDate(lastSyncTime)}</span>
          </Badge>
        )}
        
        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 flex items-center gap-2 hover:bg-grafana-dark-100">
                <Avatar className="h-7 w-7 bg-grafana-dark-100">
                  <AvatarFallback className="bg-grafana-orange text-white text-xs">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-grafana-text text-sm">{user.username}</span>
                <ChevronDown className="h-4 w-4 text-grafana-text" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-grafana-dark-200 border-grafana-dark-100 text-grafana-text">
              <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-grafana-dark-100" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer hover:bg-grafana-dark-100 hover:text-white focus:bg-grafana-dark-100 focus:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
