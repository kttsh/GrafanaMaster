// デフォルトの管理者ユーザーを返す簡易版のフック
export function useAuth() {
  // 常に認証済みの管理者ユーザーを返す
  const mockUser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
  };
  
  return {
    user: mockUser,
    isLoading: false,
    error: null,
    // これらの関数は必要なくなりましたが、互換性のために空の実装を提供
    loginMutation: { mutate: () => {}, isLoading: false } as any,
    logoutMutation: { mutate: () => {}, isLoading: false } as any,
    registerMutation: { mutate: () => {}, isLoading: false } as any
  };
}

// AuthProviderは不要になりましたが、既存のコードでの参照をサポートするために空の実装を提供
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
