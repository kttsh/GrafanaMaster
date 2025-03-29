/**
 * 認証が不要なシステムのためのシンプル化されたauth hook
 * 常に認証済みの管理者ユーザーを返します
 * React 19ではアロー関数スタイルとconstをより使用しています
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
 * React 19ではアロー関数スタイルとTypeScriptの型付けがより重要になっています
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
