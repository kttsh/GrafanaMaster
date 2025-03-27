import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import UsersPage from "@/pages/users-page";
import OrganizationsPage from "@/pages/organizations-page";
import TeamsPage from "@/pages/teams-page";
import SyncPage from "@/pages/sync-page";
import SettingsPage from "@/pages/settings-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/organizations" component={OrganizationsPage} />
      <ProtectedRoute path="/teams" component={TeamsPage} />
      <ProtectedRoute path="/sync" component={SyncPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <AuthPage path="/auth" />
      <NotFound />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
