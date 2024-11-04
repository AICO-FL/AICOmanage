# AICO Management System

AICOチャットボットの会話ログと各種設定を管理するWebアプリケーションです。

## 機能一覧

- 会話ログの管理と検索
- 端末のステータス監視
- キーワードに基づくアクション設定
- Chatwork/メール通知
- ファイル管理（画像・動画）
- ユーザー管理

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- TanStack Query
- Tailwind CSS
- Lucide Icons
- React Router
- React Hook Form
- Zod
- Zustand

### バックエンド
- Node.js
- Express
- Prisma (PostgreSQL)
- JWT認証
- Server-Sent Events
- Winston (ロギング)

## 必要要件

- Node.js 18以上
- PostgreSQL 14以上
- npm 9以上

## 開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone [repository-url]
cd aico-management
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env`ファイルを作成し、以下の項目を設定：
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aico_management"

# Authentication
JWT_SECRET="your-secure-secret-key"
JWT_EXPIRES_IN=24h

# External Services
CHATWORK_API_KEY="your-chatwork-api-key"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"

# File Storage
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
```

4. データベースのセットアップ

### 新規インストール時

```bash
# マイグレーションファイルの作成と実行
npx prisma migrate dev --name init

# 初期データの投入
npx prisma db seed
```

### データベースの初期化（リセット）

データベースを完全に初期化する場合は、以下の手順を順番に実行してください：

1. PostgreSQLの接続を確認・リセット
```sql
-- PostgreSQLに接続
psql -U postgres

-- 既存の接続を終了
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'aico_management';

-- データベースを削除して再作成
DROP DATABASE IF EXISTS aico_management;
CREATE DATABASE aico_management;

-- 終了
\q
```

2. Prismaの状態をリセット
```bash
# Prismaクライアントを再生成
npx prisma generate

# マイグレーションを実行
npx prisma migrate deploy

# 初期データを投入
npx prisma db seed
```

### トラブルシューティング

データベースの初期化で問題が発生した場合：

1. PostgreSQLサービスの状態確認
```bash
# Windowsの場合
services.msc
# PostgreSQLサービスが実行中であることを確認
```

2. データベース接続の確認
```bash
psql -U postgres -d aico_management
# 接続できない場合はパスワードやホスト名を確認
```

3. 環境変数の確認
```bash
# .envファイルのDATABASE_URLが正しいことを確認
cat .env
```

4. Prismaの状態をクリーンアップ
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install

# Prismaクライアントを強制的に再生成
npx prisma generate --force
```

5. マイグレーションの再実行
```bash
# マイグレーションをリセット
npx prisma migrate reset --force

# マイグレーションを適用
npx prisma migrate deploy

# 初期データを投入
npx prisma db seed
```

5. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で利用可能になります。

## 本番環境へのデプロイ

1. ビルド
```bash
npm run build
```

2. サーバーの起動
```bash
npm start
```

## API仕様

### 認証

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

Response:
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "admin"
  }
}
```

### 端末管理

```
GET /api/terminals
Authorization: Bearer <token>

Response:
[
  {
    "id": "terminal-id",
    "aicoId": "aico123",
    "name": "Terminal 1",
    "status": "ONLINE",
    "greeting": "こんにちは",
    "lastPolling": "2024-01-01T00:00:00Z"
  }
]
```

### 会話ログ

```
GET /api/conversations
Authorization: Bearer <token>

Query Parameters:
- terminalId: 端末ID（オプション）
- startDate: 開始日時
- endDate: 終了日時
- keyword: 検索キーワード（オプション）

Response:
[
  {
    "id": "conversation-id",
    "messageId": "msg123",
    "terminalId": "terminal-id",
    "speaker": "USER",
    "message": "こんにちは",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

## ディレクトリ構造

```
aico-management/
├── src/
│   ├── components/     # Reactコンポーネント
│   ├── hooks/         # カスタムフック
│   ├── pages/         # ページコンポーネント
│   ├── stores/        # 状態管理
│   ├── types/         # 型定義
│   └── utils/         # ユーティリティ関数
├── server/
│   ├── controllers/   # APIコントローラー
│   ├── middleware/    # ミドルウェア
│   ├── routes/        # ルーティング
│   ├── services/      # ビジネスロジック
│   └── utils/         # ユーティリティ関数
├── prisma/
│   ├── schema.prisma  # データベーススキーマ
│   └── seed.ts        # シードスクリプト
└── uploads/           # アップロードファイル保存先
```

## 開発ガイドライン

1. コーディング規約
- ESLintとPrettierの設定に従う
- コンポーネントは機能単位で分割
- 型定義は明示的に行う
- テストコードを書く

2. Git運用
- featureブランチで開発
- コミットメッセージは具体的に
- PRはレビュー必須

3. セキュリティ
- 認証・認可の徹底
- 入力値のバリデーション
- SQLインジェクション対策
- XSS対策

## トラブルシューティング

### データベース接続エラー

1. PostgreSQLの起動確認
```bash
sudo service postgresql status
```

2. 接続情報の確認
```bash
psql -U postgres -d aico_management
```

3. ファイアウォール設定の確認
```bash
sudo ufw status
```

### ログの確認

エラーログは`logs/`ディレクトリに出力されます：
- error.log: エラー情報
- combined.log: 全てのログ
- auth.log: 認証関連のログ

## ライセンス

MIT License

## サポート

問題や質問がある場合は、Issueを作成してください。