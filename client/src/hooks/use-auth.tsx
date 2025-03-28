/**
 * 認証が不要なシステムのためのシンプル化されたauth hook
 * 常に認証済みの管理者ユーザーを返します
 */
export function useAuth() {
  const user = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
  };
  
  return {
    user,
    isLoading: false,
    error: null,
  };
}

/**
 * 下位互換性のための空のプロバイダー実装
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
