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

## API 型定義の生成（buf）

API 定義を更新したら、TS 型定義を再生成します。

```sh
cd src/sapphillon-front
buf generate vendor/Sapphillon_API --template buf.gen.yaml
```

生成物は `src/sapphillon-front/src/gen` に出力されます。

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
  - `sapphillon-client.ts`: Sapphillon クライアント（現状モック）
- `src/gen`: `buf` 生成の TypeScript 型定義 / サービス定義
- `vendor/Sapphillon_API`: API 定義（proto; Git サブモジュール）

## メモ

- 将来的にバックエンド接続を行う際は、Connect Web Transport を導入し、`/debug` のモック呼び出しを実クライアントに差し替えます。
