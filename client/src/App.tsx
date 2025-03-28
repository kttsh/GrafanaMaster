
import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto p-4">
          <Switch>
            <Route path="/" component={HomePage} />
          </Switch>
        </main>
      </div>
    </QueryClientProvider>
  );
}

function HomePage() {
  return (
    <div className="prose">
      <h1>Grafana Management System</h1>
      <p>Welcome to the simplified management interface.</p>
    </div>
  );
}
