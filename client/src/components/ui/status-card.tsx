import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color: "blue" | "green" | "yellow" | "red" | "purple";
}

/**
 * ステータスカードコンポーネント
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const StatusCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: StatusCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return { 
          bg: "bg-grafana-blue/20", 
          text: "text-grafana-blue",
          border: "border-grafana-blue/30"
        };
      case "green":
        return { 
          bg: "bg-grafana-green/20", 
          text: "text-grafana-green",
          border: "border-grafana-green/30"
        };
      case "yellow":
        return { 
          bg: "bg-yellow-500/20", 
          text: "text-yellow-400",
          border: "border-yellow-500/30"
        };
      case "red":
        return { 
          bg: "bg-grafana-error/20", 
          text: "text-grafana-error",
          border: "border-grafana-error/30"
        };
      case "purple":
        return { 
          bg: "bg-purple-500/20", 
          text: "text-purple-400",
          border: "border-purple-500/30"
        };
      default:
        return { 
          bg: "bg-grafana-blue/20", 
          text: "text-grafana-blue",
          border: "border-grafana-blue/30"
        };
    }
  };

  const { bg, text, border } = getColorClasses();

  return (
    <Card className={cn(
      "bg-grafana-dark-200 border shadow-lg overflow-hidden",
      border
    )}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-grafana-text font-medium text-sm">{title}</h3>
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
            <div className={cn(text)}>{icon}</div>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-grafana-text/80">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
