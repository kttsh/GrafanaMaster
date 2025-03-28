
import { useState } from 'react';

export function useAuth() {
  const [user] = useState({
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
  });

  return {
    user,
    isLoading: false,
    error: null
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return children;
}
