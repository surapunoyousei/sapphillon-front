## Done

- サブモジュール追加: `src/sapphillon-front/vendor/Sapphillon_API`（tag `v0.4.0-alpha`）
- 生成設定: `buf.gen.yaml`（v2）追加、TS クライアントを `src/sapphillon-front/src/gen` に生成
- 依存整理: `deno.json` に `@bufbuild/protobuf`、`@tanstack/react-query`、Devtools（本番はスタブ）を追加
- モック実装: `src/lib/sapphillon-client.ts` に `createMockVersionClient()` を追加
- React Query 基盤: `QueryClientProvider` を `src/main.tsx` に組み込み
- Devtools: 開発時のみ表示、本番ビルドは `vite.config.ts` の alias でスタブへ切替
- ルーティング: `/debug` を追加
- デバッグページ: `src/app/debug.tsx`
  - Floorp BrowserOS: `getAllContextData()` を実行して結果表示
  - Sapphillon: `VersionService.GetVersion`（モック）を実行して結果表示
- ビルド確認: `deno task build` 成功

## Next

- バックエンド準備後の実接続対応

  - `deno.json` に `@connectrpc/connect`, `@connectrpc/connect-web` を追加
  - `src/lib/sapphillon-client.ts` に transport + real client 実装（`createPromiseClient`）
  - `vite.config.ts` に `/rpc` → backend の proxy を追加し、`BASE_URL` を `/rpc` に固定
  - `/debug` の Sapphillon 呼び出しをモックから実クライアントに切替

- デバッグ機能拡張

  - `WorkflowService` など他の RPC 呼び出しを追加
  - BrowserOS API の追加ボタン（`ws*`, `tm*` 系）

- 生成ワークフローのタスク化

  - `deno.json` にコード生成タスクを追加（例）
    - `"gen": "buf generate vendor/Sapphillon_API --template buf.gen.yaml"`

- エラーハンドリング/UX

  - ローディング・エラー表示の統一化、トースト導入

- ドキュメント
  - 開発手順、コード生成手順、バックエンド接続手順の整備
