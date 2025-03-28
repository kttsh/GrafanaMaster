import { Route } from "wouter";

/**
 * 認証不要のシステムのためのシンプル化されたルートラッパー
 * 常にコンポーネントを表示します
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return <Route path={path} component={Component} />;
}
