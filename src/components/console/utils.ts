export type GenerationEvent = {
  t: number;
  kind: "message" | "error" | "done";
  payload?: unknown;
};

export function stringifyPayload(p: unknown): string {
  if (p == null) return "";
  if (typeof p === "string") return p;
  if (p instanceof Error) {
    return p.stack || p.message || String(p);
  }

  // React SyntheticEvent のような循環参照オブジェクトの簡易表現
  if (p && typeof p === "object") {
    const anyP = p as Record<string, unknown>;
    if (
      "nativeEvent" in anyP &&
      typeof anyP["nativeEvent"] === "object" &&
      "isDefaultPrevented" in anyP
    ) {
      const type = typeof anyP["type"] === "string" ? anyP["type"] : "unknown";
      return `[SyntheticEvent type=${String(type)}]`;
    }
  }

  // protobuf / gRPC 生成物などで toJSON/toJsonString/toObject を持つケースを優先
  try {
    if (p && typeof p === "object") {
      const anyP = p as Record<string, unknown> & {
        toJsonString?: (opts?: unknown) => unknown;
        toJSON?: () => unknown;
        toObject?: () => unknown;
      };
      if (typeof anyP.toJsonString === "function") {
        try {
          // 一部実装は prettySpaces オプションを受け取る
          return String(anyP.toJsonString({ prettySpaces: 2 }));
        } catch {
          // ignore
          return String(anyP.toJsonString?.());
        }
      }
      if (typeof anyP.toJSON === "function") {
        try {
          return JSON.stringify(anyP, null, 2);
        } catch {
          // ignore
          try {
            return JSON.stringify(anyP.toJSON(), null, 2);
          } catch {
            // ignore
          }
        }
      }
      if (typeof anyP.toObject === "function") {
        try {
          return JSON.stringify(anyP.toObject(), null, 2);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore — 下の safeStringify にフォールバック
  }

  // それ以外は安全な JSON 化（循環参照/特殊型対応）を試みる
  try {
    return safeStringify(p, 2);
  } catch {
    // 最後の砦として toString にフォールバック（[object Object] の可能性は残るがほぼ到達しない）
    try {
      return String(p);
    } catch {
      return "[Unserializable]";
    }
  }
}

function safeStringify(value: unknown, space = 2): string {
  const seen = new WeakSet<object>();

  const isDomNode = (v: unknown) => {
    // Node が未定義な環境（SSR等）を考慮
    const NodeCtor: typeof Node | undefined = (
      globalThis as unknown as { Node?: typeof Node }
    ).Node;
    return !!NodeCtor && v instanceof NodeCtor;
  };

  const replacer = (_key: string, val: unknown) => {
    // 原始型や null はそのまま
    if (val === null) return val;
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean") return val;

    if (t === "bigint") return String(val as bigint);
    if (t === "symbol") return String(val as symbol);
    if (t === "function") {
      const fnName = (val as { name?: unknown }).name;
      const nameStr = typeof fnName === "string" && fnName ? `: ${fnName}` : "";
      return `[Function${nameStr}]`;
    }

    if (val instanceof Error) {
      return { name: val.name, message: val.message, stack: val.stack };
    }
    if (val instanceof Date) return val.toISOString();
    if (val instanceof RegExp) return val.toString();
    if (typeof Map !== "undefined" && val instanceof Map) {
      return Object.fromEntries(
        Array.from((val as Map<unknown, unknown>).entries())
      );
    }
    if (typeof Set !== "undefined" && val instanceof Set) {
      return Array.from((val as Set<unknown>).values());
    }
    if (isDomNode(val)) {
      try {
        return `[Node ${(val as { nodeName?: unknown }).nodeName ?? "?"}]`;
      } catch {
        return `[Node]`;
      }
    }

    if (t === "object") {
      const obj = val as object;
      if (seen.has(obj)) return "[Circular]";
      seen.add(obj);
    }
    return val;
  };

  return JSON.stringify(value, replacer, space);
}

export function fmtTime(t: number): string {
  const d = new Date(t);
  return d.toLocaleTimeString();
}

export function inlineSnippet(s: string, max = 100): string {
  // 改行や連続空白を 1 つのスペースに畳み、指定長で省略
  const oneLine = s.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}
