/**
 * 認証が不要なシステムのためのシンプル化されたauth hook
 * 常に認証済みの管理者ユーザーを返します
 * React 19ではhookはarrow functionでの定義が推奨されています
 */
export const useAuth = () => {
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
};

/**
 * 下位互換性のための空のプロバイダー実装
 * React 19ではコンポーネントはarrow functionでの定義が推奨されています
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
