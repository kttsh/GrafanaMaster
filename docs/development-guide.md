
# Grafana Master Management System 開発ガイド

## 1. プロジェクトのセットアップ

### 1.1 依存関係のインストール
```bash
npm install
```

### 1.2 環境変数の設定
`.env`ファイルを作成し、以下の環境変数を設定:
```
DATABASE_URL="postgresql://user:password@localhost:5432/grafana_master"
SESSION_SECRET="your-session-secret"
```

### 1.3 データベースのセットアップ
```bash
npx prisma db push
```

## 2. アプリケーションの構造

### 2.1 主要なディレクトリ
- `client/`: フロントエンド（React）
  - `src/`: ソースコード
    - `components/`: UIコンポーネント
    - `pages/`: ページコンポーネント
    - `lib/`: ユーティリティ関数
    - `hooks/`: カスタムフック
- `server/`: バックエンド（Express）
  - `routes/`: APIエンドポイント
  - `mocks/`: モックデータ
- `prisma/`: データベーススキーマ
- `shared/`: 共有型定義

## 3. 開発手順

### 3.1 バックエンド開発
1. `prisma/schema.prisma`でデータモデルを定義
2. `server/routes.ts`でAPIエンドポイントを実装
3. `server/mocks/`で開発用モックデータを作成

### 3.2 フロントエンド開発
1. `client/src/components/`でUIコンポーネントを作成
2. `client/src/pages/`で新しいページを実装
3. `client/src/lib/queryClient.ts`でAPI通信を実装

### 3.3 共有型の定義
1. `shared/types.ts`で共有の型定義を作成
2. `shared/schema.ts`でZodスキーマを定義

## 4. 主要な機能実装

### 4.1 ユーザー管理
- Grafanaユーザーの作成、編集、削除
- 組織とチームの割り当て
- 権限管理

### 4.2 組織管理
- 組織の作成、編集、削除
- メンバー管理
- チーム管理

### 4.3 同期機能
- Grafana APIとの同期
- Opoppoユーザーデータの同期
- 同期ログの管理

## 5. テスト

### 5.1 バックエンドテスト
```bash
npm run test:server
```

### 5.2 フロントエンドテスト
```bash
npm run test:client
```

## 6. ビルドとデプロイ

### 6.1 本番用ビルド
```bash
npm run build
```

### 6.2 デプロイ
1. Replitのデプロイメントタブを開く
2. "Deploy"ボタンをクリック
3. デプロイ設定を確認
4. デプロイを実行

## 7. 開発のベストプラクティス

### 7.1 コーディング規約
- TypeScriptの厳格モードを使用
- コンポーネントは関数コンポーネントで実装
- Hooksルールに従う
- 適切なエラーハンドリング

### 7.2 状態管理
- React QueryでAPIデータを管理
- フォームはReact Hook Formで実装
- バリデーションはZodで実装

### 7.3 UI/UXガイドライン
- Grafanaのデザインシステムに準拠
- レスポンシブデザインの実装
- アクセシビリティへの配慮

## 8. トラブルシューティング

### 8.1 一般的な問題
- デバッグログの確認方法
- 一般的なエラーと解決方法
- パフォーマンス最適化のヒント

### 8.2 開発環境の問題
- 環境変数の問題
- データベース接続の問題
- ビルドエラーの解決

## 9. 参考リンク
- [Grafana HTTP API Reference](https://grafana.com/docs/grafana/latest/developers/http_api/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Prisma Documentation](https://www.prisma.io/docs/)
