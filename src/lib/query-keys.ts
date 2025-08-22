// TanStack Query key helpers
// 型安全かつ衝突防止のため集中管理

export const QK = {
  workflow: {
    latest: () => ["workflow", "latest"] as const,
  },
  version: {
    get: () => ["version", "get"] as const,
  },
} as const;

export type QueryKeyOf<T extends (...args: unknown[]) => readonly unknown[]> =
  ReturnType<T>;
