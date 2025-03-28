import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart3, 
  Users, 
  Building, 
  Users2, 
  RefreshCw
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Organizations",
    href: "/organizations",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Teams",
    href: "/teams",
    icon: <Users2 className="h-5 w-5" />,
  },
  {
    title: "Synchronization",
    href: "/sync",
    icon: <RefreshCw className="h-5 w-5" />,
  },
];

interface SidebarProps {
  onSyncClick?: () => void;
  isSyncing?: boolean;
}

export default function Sidebar({ onSyncClick, isSyncing = false }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-14 md:w-64 bg-grafana-dark border-r border-grafana-dark-100 flex-shrink-0">
      <nav className="p-2 h-full flex flex-col">
        <ul className="space-y-2 flex-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded text-grafana-text hover:bg-grafana-dark-100 transition-colors",
                  location === item.href && "text-white bg-grafana-orange hover:bg-grafana-orange/90"
                )}
              >
                <span className="text-xl md:mr-2">{item.icon}</span>
                <span className="hidden md:inline-block">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        {user && (
          <div className="p-3 border-t border-grafana-dark-100 hidden md:block">
            <Button
              onClick={onSyncClick}
              disabled={isSyncing}
              className="w-full flex items-center justify-center px-4 py-2 rounded bg-grafana-teal hover:bg-grafana-teal/90 text-grafana-dark font-medium transition-colors"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </Button>
          </div>
        )}
      </nav>
    </aside>
  );
}
