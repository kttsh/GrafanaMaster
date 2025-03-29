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

export default function StatusCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: StatusCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return { bg: "bg-blue-500/20", text: "text-blue-400" };
      case "green":
        return { bg: "bg-grafana-success/20", text: "text-grafana-success" };
      case "yellow":
        return { bg: "bg-grafana-warning/20", text: "text-grafana-warning" };
      case "red":
        return { bg: "bg-grafana-error/20", text: "text-grafana-error" };
      case "purple":
        return { bg: "bg-purple-500/20", text: "text-purple-400" };
      default:
        return { bg: "bg-blue-500/20", text: "text-blue-400" };
    }
  };

  const { bg, text } = getColorClasses();

  return (
    <Card className="bg-grafana-dark-100 border border-grafana-dark-200 rounded-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-grafana-text font-medium">{title}</h3>
          <div className={cn("w-10 h-10 rounded-md flex items-center justify-center", bg)}>
            <div className={cn("text-xl", text)}>{icon}</div>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-semibold text-white">{value}</p>
          {subtitle && <p className="text-xs text-grafana-text">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
