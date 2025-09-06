# Sapphillon Front (Deno + Vite + React)

Sapphillon（Floorp OS）のフロントエンドです。`buf` で生成した TypeScript 型定義と Connect RPC を用いて、バックエンド API とやり取りします。さらに、Mozilla の Actor を用いて Floorp 側の BrowserOS API を呼び出します。

## 必要要件

- Deno v2.0.0 以上
- Buf CLI v2 以上（コード生成に使用）
- Git submodule（`vendor/Sapphillon_API`）
  - Floorp プラグイン用 proto は `vendor/Floorp_API` にあります

## 初期セットアップ

サブモジュールを取得します。

```sh
git submodule update --init --recursive
```

## API 型定義 & gRPC クライアント生成（buf）

proto を更新 / 追加したら次で再生成します（Sapphillon API と Floorp プラグイン API の両方を対象）:

```sh
deno task gen
```

生成物は `src/gen` に出力されます。

本プロジェクトの `buf.gen.yaml` は `@bufbuild/protoc-gen-es` と `@connectrpc/protoc-gen-connect-es` を使用して、
TypeScript のメッセージとサービス定義（および Connect クライアント補助）を生成します。

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

### Floorp プラグイン（browser_info / tab_manager / webscraper）

バックエンドに統合された Floorp の各プラグインの proto は `vendor/Floorp_API/proto` にあります。
`deno task gen` 実行後、生成物は以下のようなパスになります（実ファイル名は proto に準拠）:

- `@/gen/sapphillon/v1/browser_info_pb.ts`
- `@/gen/sapphillon/v1/tab_manager_pb.ts`
- `@/gen/sapphillon/v1/webscraper_pb.ts`

ブラウザからの呼び出し用に、便利なラッパー関数を `src/lib/floorp-plugins.ts` に追加しました。
使用例:

```ts
import {
  browserInfoGetAllContextData,
  tabManagerCreateInstance,
  tabManagerListTabs,
  webscraperCreateInstance,
  webscraperGetHTML,
} from "@/lib/floorp-plugins.ts";

// BrowserInfo: 直近履歴/ダウンロードなどのコンテキスト情報
const { parsed } = await browserInfoGetAllContextData({ historyLimit: 10 });

// TabManager: タブを開き、一覧し、ナビゲートし、HTML を取得
const { instanceId } = await tabManagerCreateInstance("https://example.com");
const list = await tabManagerListTabs();
await tabManagerNavigate(instanceId, "https://example.com/docs");
const html = await tabManagerGetHTML(instanceId);

// Webscraper: スクレイピング用のインスタンスを作成し HTML を取得
const created = await webscraperCreateInstance("https://news.ycombinator.com");
const html2 = await webscraperGetHTML(created.instanceId);
```

> 備考: `webscraper.proto` のサービス名は現在 `TabManagerService`（パッケージは `sapphillon.v1.floorpWebscraper`）になっています。
> 生成コードでは重複を避けるためエイリアスして利用しています。

### gRPC 接続設定（フロントエンド）

`src/lib/grpc-clients.ts` で gRPC-Web のトランスポートを用意しています。

- 基本 URL は `import.meta.env.VITE_GRPC_BASE_URL`（未設定なら `http://localhost:50051`）
- 既定でリクエスト ID 付与・ロギング・エラー正規化の Interceptor を適用

サーバ側はブラウザからの gRPC-Web を受け付ける必要があります（例: tonic + `tonic-web` / Envoy / grpcwebproxy 等）。
開発環境では CORS 設定の許可も必要です。

```sh
# 例: 一時的にエンドポイントを上書きして起動
VITE_GRPC_BASE_URL=http://localhost:8080 deno task dev
```

### エラーハンドリング

`ConnectError` 非由来の例外も `errorNormalizeInterceptor` で `ConnectError` に正規化されます。
UI からは `try/catch` でメッセージを表示するか、React Query の `onError` を利用してください。


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
