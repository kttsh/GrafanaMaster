import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return d.toLocaleDateString();
  }
}

export function getStatusColor(status: string | undefined): { text: string, bg: string, dot: string } {
  switch (status?.toLowerCase()) {
    case 'active':
      return { 
        text: 'text-grafana-success', 
        bg: 'bg-grafana-success/20', 
        dot: 'bg-grafana-success' 
      };
    case 'pending':
      return { 
        text: 'text-grafana-warning', 
        bg: 'bg-grafana-warning/20', 
        dot: 'bg-grafana-warning' 
      };
    case 'disabled':
      return { 
        text: 'text-grafana-error', 
        bg: 'bg-grafana-error/20', 
        dot: 'bg-grafana-error' 
      };
    default:
      return { 
        text: 'text-gray-400', 
        bg: 'bg-gray-400/20', 
        dot: 'bg-gray-400' 
      };
  }
}

export function getInitials(name: string | undefined | null): string {
  if (!name) return "??";
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
