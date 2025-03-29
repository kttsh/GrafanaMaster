import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BarChart3, 
  Users, 
  Building, 
  Users2, 
  RefreshCw,
  LayoutDashboard
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
};

const navItems: NavItem[] = [
  {
    title: "ダッシュボード",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: "システム全体の概要とステータス"
  },
  {
    title: "ユーザー",
    href: "/users",
    icon: <Users className="h-5 w-5" />,
    description: "Grafanaユーザーの管理"
  },
  {
    title: "組織",
    href: "/organizations",
    icon: <Building className="h-5 w-5" />,
    description: "Grafana組織の管理"
  },
  {
    title: "チーム",
    href: "/teams",
    icon: <Users2 className="h-5 w-5" />,
    description: "Grafanaチームの管理"
  },
  {
    title: "同期",
    href: "/sync",
    icon: <RefreshCw className="h-5 w-5" />,
    description: "データ同期の履歴と管理"
  },
];

interface SidebarProps {
  onSyncClick?: () => void;
  isSyncing?: boolean;
}

/**
 * サイドバーコンポーネント
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const Sidebar = ({ onSyncClick, isSyncing = false }: SidebarProps) => {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-14 md:w-64 bg-grafana-dark-200 border-r border-grafana-dark-100 flex-shrink-0 flex flex-col">
      <ScrollArea className="flex-1">
        <nav className="p-2 pt-4 h-full flex flex-col">
          <TooltipProvider>
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <li key={item.href}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Link 
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 rounded text-grafana-text hover:bg-grafana-dark-100 transition-colors",
                            isActive && "text-white bg-grafana-orange hover:bg-grafana-orange/90"
                          )}
                        >
                          <span className="text-xl md:mr-3">{item.icon}</span>
                          <span className="hidden md:inline-block">{item.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="md:hidden bg-grafana-dark-100 border-grafana-dark-100 text-grafana-text">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-grafana-text/70">{item.description}</span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        </nav>
      </ScrollArea>

      {user && (
        <div className="p-3 border-t border-grafana-dark-100 hidden md:block">
          <Button
            onClick={onSyncClick}
            disabled={isSyncing}
            variant="default"
            className="w-full bg-grafana-green hover:bg-grafana-green/90 text-black font-medium transition-colors"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
            <span>{isSyncing ? "同期中..." : "今すぐ同期"}</span>
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
