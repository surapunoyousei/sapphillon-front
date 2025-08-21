# Sapphillon Front (Deno + Vite + React)

Sapphillon（Floorp OS）のフロントエンドです。`buf` で生成した TypeScript 型定義と Connect RPC を用いて、バックエンド API とやり取りします。さらに、Mozilla の Actor を用いて Floorp 側の BrowserOS API を呼び出します。

## 必要要件

- Deno v2.0.0 以上
- Buf CLI v2 以上（コード生成に使用）
- Git submodule（`vendor/Sapphillon_API`）

## 初期セットアップ

サブモジュールを取得します。

```sh
git submodule update --init --recursive
```

## API 型定義 & gRPC クライアント生成（buf）

proto を更新 / 追加したら次で再生成します:

```sh
deno task gen
```

生成物は `src/gen` に出力されます。

### サービスクライアント集約

`src/lib/grpc-clients.ts` が全サービスの gRPC-Web クライアントを生成し `clients` をエクスポートします。
新しい service を追加した場合:

1. proto を追加 (サブモジュール更新など)
2. `deno task gen`
3. `grpc-clients.ts` に import と client を追加

例:

```ts
import { NewService } from "@/gen/sapphillon/v1/new_service_pb";
export const newClient = createClient(NewService, transport);
export const clients = { ...clients, new: newClient }; // 既存定義を編集する形でも良い
```

## 開発

開発サーバを起動します。

```sh
deno task dev
```

ブラウザで `http://localhost:5173` を開きます。

デバッグページは `/debug` です（BrowserOS API の簡易呼び出しと、Sapphillon モック API 呼び出しを確認できます）。

## ビルド / プレビュー

本番ビルド:

```sh
deno task build
```

ビルド成果物のプレビュー:

```sh
deno task preview
```

静的配信（`dist/`）:

```sh
deno task serve
```

## テスト

```sh
deno task test          # 一回実行
deno task test:watch    # 監視実行
```

## ディレクトリ構成（抜粋）

- `src/app`: 画面コンポーネント（`/`、`/debug`）
- `src/components`: UI コンポーネント
- `src/lib`:
  - `browser-os.ts`: Floorp 側の BrowserOS API アクセス
  - `grpc-clients.ts`: 生成された service に基づく gRPC-Web クライアント集約
  - `sapphillon-client.ts`: 互換レイヤ (旧 import 用)
- `src/gen`: `buf` 生成の TypeScript 型定義 / サービス定義
- `vendor/Sapphillon_API`: API 定義（proto; Git サブモジュール）

## メモ

- 現在は tonic_web に合わせ gRPC-Web transport を利用。Connect プロトコルを有効化する場合はサーバ側で適切な gateway / h2c を追加してください。
