import { Route } from "wouter";

/**
 * 認証不要のシステムのためのシンプル化されたルートラッパー
 * 常にコンポーネントを表示します
 * React 19ではコンポーネントはarrow functionでの定義が推奨されています
 */
export const ProtectedRoute = ({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) => {
  return <Route path={path} component={Component} />;
};
