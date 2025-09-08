// gRPC-Web clients aggregation
// 現在の全 proto Service についてクライアントを生成してまとめてエクスポートします。
// 新しい service を追加したら proto 更新 -> `deno task gen` -> ここに import & client 追加。

import { ConnectError, createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import type { Interceptor } from "@connectrpc/connect";

import { VersionService } from "@/gen/sapphillon/v1/version_pb.ts";
import { WorkflowService } from "@/gen/sapphillon/v1/workflow_service_pb.ts";

interface EnvLike {
  [k: string]: unknown;
}
interface ImportMetaLike {
  env?: EnvLike;
}
const im = import.meta as unknown as ImportMetaLike;
const baseUrl = "http://127.0.0.1:50051";

export const transport = createGrpcWebTransport({ baseUrl });

// ----------------------
// Interceptors
// ----------------------

// 1. Request ID 付与 (各リクエストに x-request-id を付加)
export function requestIdInterceptor(headerKey = "x-request-id"): Interceptor {
  return (next) => (req) => {
    // Connect のヘッダはヘッダマップ (req.header) で操作できる
    try {
      const id = globalThis.crypto?.randomUUID?.() ||
        Math.random().toString(36).slice(2);
      if (!req.header.has(headerKey)) {
        req.header.set(headerKey, id);
      }
    } catch {
      /* ignore */
    }
    return next(req);
  };
}

// 2. 任意メタデータ挿入 (遅延評価)
export function metadataInterceptor(
  getters: Record<string, () => string | undefined>,
): Interceptor {
  return (next) => (req) => {
    for (const [k, fn] of Object.entries(getters)) {
      if (!req.header.has(k)) {
        const v = fn();
        if (v) req.header.set(k, v);
      }
    }
    return next(req);
  };
}

// 3. ログ (時間計測 / ステータス)
export function loggingInterceptor(): Interceptor {
  return (next) => async (req) => {
    const start = performance.now();
    const fullName = `${req.service.typeName}.${req.method.name}`;
    try {
      const res = await next(req);
      const ms = (performance.now() - start).toFixed(1);
      // eslint-disable-next-line no-console
      console.debug(`[gRPC] ✅ ${fullName} (${ms} ms)`);
      return res;
    } catch (e) {
      const ms = (performance.now() - start).toFixed(1);
      // eslint-disable-next-line no-console
      console.error(`[gRPC] ❌ ${fullName} (${ms} ms)`, e);
      throw e;
    }
  };
}

// 4. エラーノーマライズ (ConnectError 以外を ConnectError に包む)
export function errorNormalizeInterceptor(): Interceptor {
  return (next) => async (req) => {
    try {
      return await next(req);
    } catch (e: unknown) {
      if (e instanceof ConnectError) throw e;
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      throw new ConnectError(`Unknown client error: ${msg}`);
    }
  };
}

// デフォルトで適用する interceptor のリスト (順序重要: 追加 -> ログ -> 正規化)
const baseInterceptors: Interceptor[] = [
  requestIdInterceptor(),
  loggingInterceptor(),
  errorNormalizeInterceptor(),
];

// 追加登録可能 (グローバル)
const extraInterceptors: Interceptor[] = [];
export function registerInterceptors(...i: Interceptor[]) {
  extraInterceptors.push(...i);
}

function buildInterceptors(custom?: Interceptor[]) {
  return [...baseInterceptors, ...extraInterceptors, ...(custom || [])];
}

// Optional: future interceptor injection hook (未実装)
export function withInterceptors(...custom: Interceptor[]) {
  // createGrpcWebTransport を再構築 (interceptors は transport 作成時に設定)
  const t = createGrpcWebTransport({
    baseUrl,
    interceptors: buildInterceptors(custom),
  });
  return {
    version: createClient(VersionService, t),
    workflow: createClient(WorkflowService, t),
  } as const;
}

// 既定クライアント (base + 登録済 extra)
// 既定トランスポート (base + extra interceptors)
const defaultTransport = createGrpcWebTransport({
  baseUrl,
  interceptors: buildInterceptors(),
});
export const versionClient = createClient(VersionService, defaultTransport);
export const workflowClient = createClient(WorkflowService, defaultTransport);

export const clients = {
  version: versionClient,
  workflow: workflowClient,
};

export type Clients = typeof clients;

export default clients;
