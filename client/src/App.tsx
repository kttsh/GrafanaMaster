import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import UsersPage from "@/pages/users-page";
import OrganizationsPage from "@/pages/organizations-page";
import TeamsPage from "@/pages/teams-page";
import SyncPage from "@/pages/sync-page";

/**
 * アプリケーションのルートルーター
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const Router = () => {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/organizations" component={OrganizationsPage} />
      <Route path="/teams" component={TeamsPage} />
      <Route path="/sync" component={SyncPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
};

/**
 * メインアプリケーションコンポーネント
 * React 19では関数コンポーネントはarrow functionでの定義が推奨されています
 */
const App = () => {
  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </div>
  );
};

export default App;
