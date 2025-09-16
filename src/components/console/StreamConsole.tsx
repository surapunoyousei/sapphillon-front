import React from "react";
import { Badge, Box, HStack, Text, Tooltip, VStack } from "@chakra-ui/react";
import { Portal } from "@chakra-ui/react";
// icons removed to avoid bundle size / naming issues; using badge + border colors

export type GenerationEvent = {
  t: number;
  kind: "message" | "error" | "done";
  payload?: unknown;
};

type Props = { events: GenerationEvent[]; streaming: boolean };

export const StreamConsole: React.FC<Props> = ({ events, streaming }) => {
  // 初期表示は上端に固定（ターミナルと同様）。ユーザーが最下部に到達したら追従を再開
  const [autoScroll, setAutoScroll] = React.useState(false);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const visible = React.useMemo(() => {
    return [...events].sort((a, b) => a.t - b.t);
  }, [events]);

  // マウント時に必ず最上部に固定（ブラウザが以前のスクロール位置を保持しているケース対策）
  React.useLayoutEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = 0;
  }, []);

  // Auto scroll behavior
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    if (autoScroll) el.scrollTop = el.scrollHeight;
  }, [visible, autoScroll]);

  const onScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (!nearBottom && autoScroll) setAutoScroll(false);
    if (nearBottom && !autoScroll) setAutoScroll(true);
  };

  const rows = toRows(visible);

  return (
    <VStack align="stretch" h="full" minH={0} gap={1}>
      <Box
        ref={viewportRef}
        minH={0}
        h="full"
        overflowY="auto"
        onScroll={onScroll}
        pr={1}
        fontFamily="mono"
        css={{ overflowAnchor: "none" }}
      >
        {visible.length === 0
          ? (
            <Text color="fg.muted" px={2}>
              {events.length === 0
                ? (streaming ? "Streaming…" : "Waiting for run…")
                : "No matches"}
            </Text>
          )
          : (
            rows.map((r, i) =>
              r.type === "sep"
                ? <SeparatorRow key={`s-${i}`} label={r.label} />
                : <LogRow key={`l-${i}`} e={r.event} index={i} />
            )
          )}
      </Box>
    </VStack>
  );
};

function LogRow({ e, index }: { e: GenerationEvent; index: number }) {
  const meta = kindMeta(e);
  const summary = summarize(e);
  const payload = stringifyPayload(e.payload);
  const inline = payload ? inlineSnippet(payload, 100) : "";
  return (
    <Box
      px={2}
      py={1}
      borderBottomWidth="1px"
      borderColor="border"
      bg={index % 2 === 1 ? "bg.subtle" : undefined}
      position="relative"
      _hover={{ bg: "bg.muted" }}
    >
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="1.5px"
        bg={meta.border}
      />
      <HStack gap={1} align="center">
        <Badge
          colorPalette={meta.palette}
          flexShrink={0}
          fontSize="10px"
          px={1}
          py={0}
        >
          {e.kind}
        </Badge>
        <Text fontSize="xs" color="fg.muted" flexShrink={0} w="72px">
          {fmtTime(e.t)}
        </Text>
        <Box flex={1} minW={0}>
          {payload
            ? (
              <Tooltip.Root
                openDelay={300}
                closeDelay={100}
                positioning={{ placement: "top-start" }}
              >
                <Tooltip.Trigger asChild>
                  <Text
                    fontSize="sm"
                    css={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {summary}
                    {inline && (
                      <Text as="span" fontFamily="mono" color="fg.muted">
                        — {inline}
                      </Text>
                    )}
                  </Text>
                </Tooltip.Trigger>
                <Portal>
                  <Tooltip.Positioner>
                    <Tooltip.Content
                      maxW="90vw"
                      maxH="50vh"
                      overflow="auto"
                      p={2}
                      fontSize="xs"
                      zIndex={1700}
                    >
                      <Tooltip.Arrow />
                      <Box
                        as="pre"
                        m={0}
                        whiteSpace="pre-wrap"
                        css={{ overflowWrap: "anywhere" }}
                        fontFamily="mono"
                      >
                        {payload}
                      </Box>
                    </Tooltip.Content>
                  </Tooltip.Positioner>
                </Portal>
              </Tooltip.Root>
            )
            : (
              <Text
                fontSize="sm"
                css={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {summary}
              </Text>
            )}
        </Box>
      </HStack>
    </Box>
  );
}

function kindMeta(e: GenerationEvent) {
  if (e.kind === "error") {
    return {
      palette: "red" as const,
      border: "red.500",
    };
  }
  if (e.kind === "done") {
    return {
      palette: "green" as const,
      border: "green.500",
    };
  }
  return {
    palette: "floorp" as const,
    border: "accent",
  };
}

type Row =
  | { type: "sep"; label: string }
  | { type: "log"; event: GenerationEvent };

function toRows(events: GenerationEvent[]): Row[] {
  const rows: Row[] = [];
  for (const e of events) {
    if (e.kind === "message") {
      const p = e.payload as unknown;
      if (
        p &&
        typeof p === "object" &&
        "stage" in p &&
        (p as { stage?: unknown }).stage === "run" &&
        "status" in p &&
        (p as { status?: unknown }).status === "start"
      ) {
        rows.push({ type: "sep", label: "Run started" });
      }

      if (p && typeof p === "object" && "workflowResult" in p) {
        const wr = (p as Record<string, unknown>).workflowResult as unknown;
        if (
          wr && typeof wr === "object" &&
          "result" in (wr as Record<string, unknown>)
        ) {
          const resultVal = (wr as Record<string, unknown>).result as unknown;
          if (typeof resultVal === "string" && /\r?\n/.test(resultVal)) {
            const lines = resultVal.replaceAll("\r\n", "\n").split("\n");
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (line.trim() === "") continue;
              const lineEvent: GenerationEvent = {
                t: e.t + i * 1e-9,
                kind: e.kind,
                payload: line,
              };
              rows.push({ type: "log", event: lineEvent });
            }
            continue;
          }
        }
      }

      // message のペイロードが文字列で複数行なら、各行に分割（空白行はスキップ）
      if (typeof p === "string" && /\r?\n/.test(p)) {
        const lines = p.replaceAll("\r\n", "\n").split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim() === "") continue;
          const lineEvent: GenerationEvent = {
            t: e.t + i * 1e-9,
            kind: e.kind,
            payload: line,
          };
          rows.push({ type: "log", event: lineEvent });
        }
        continue;
      }
    }
    if (e.kind === "done") {
      const payload = e.payload as unknown;
      const stage = payload && typeof payload === "object" && "stage" in payload
        ? (payload as { stage?: unknown }).stage
        : undefined;
      if (stage === "run") rows.push({ type: "sep", label: "Run completed" });
      if (stage === "generate") {
        rows.push({ type: "sep", label: "Generation completed" });
      }
    }
    rows.push({ type: "log", event: e });
  }
  return rows;
}

function SeparatorRow({ label }: { label: string }) {
  return (
    <HStack align="center" my={0.5} px={1} color="fg.muted">
      <Box flex="1" borderTopWidth="1px" borderColor="border" />
      <Text fontSize="xs" px={2} whiteSpace="nowrap">{label}</Text>
      <Box flex="1" borderTopWidth="1px" borderColor="border" />
    </HStack>
  );
}

function summarize(e: GenerationEvent): string {
  if (e.kind === "error") {
    const err = e.payload as unknown;
    const msg = typeof err === "object" && err && "message" in err
      ? String((err as { message?: unknown }).message ?? "")
      : String(err);
    return msg || "Error";
  }
  if (e.kind === "done") {
    const p = e.payload as unknown;
    const stage = p && typeof p === "object" && "stage" in p
      ? (p as { stage?: unknown }).stage
      : undefined;
    if (stage === "run") return "Run completed";
    if (stage === "generate") return "Generation completed";
    return "Done";
  }
  // message
  const p = e.payload as unknown;
  if (p && typeof p === "object") {
    if (
      "stage" in p && (p as { stage?: unknown }).stage === "run" &&
      "status" in p && (p as { status?: unknown }).status === "start"
    ) return "Run started";
    if (
      "workflowResult" in p &&
      (p as { workflowResult?: unknown }).workflowResult
    ) {
      const r = (p as { workflowResult?: unknown }).workflowResult;
      const displayName = r && typeof r === "object" && "displayName" in r
        ? (r as Record<string, unknown>).displayName
        : undefined;
      const id = r && typeof r === "object" && "id" in r
        ? (r as Record<string, unknown>).id
        : undefined;
      const resultType = r && typeof r === "object" && "resultType" in r
        ? (r as Record<string, unknown>).resultType
        : undefined;
      const exitCode = r && typeof r === "object" && "exitCode" in r
        ? (r as Record<string, unknown>).exitCode
        : undefined;
      const name = (displayName || id || "Run") as string;
      const type = resultType === 1 ? "FAILURE" : "SUCCESS";
      const exit = typeof exitCode === "number" ? `, exit ${exitCode}` : "";
      // Prefer textual result if present
      const resultStr = r && typeof r === "object" && "result" in r
        ? (r as Record<string, unknown>).result
        : undefined;
      if (typeof resultStr === "string" && resultStr.trim()) {
        const txt = resultStr.trim();
        return txt.length > 160 ? txt.slice(0, 160) + "…" : txt;
      }
      return `${name}: ${type}${exit}`;
    }
    if (
      "workflowDefinition" in p &&
      (p as { workflowDefinition?: unknown }).workflowDefinition
    ) return "Updated workflow definition";
  }
  try {
    const s = stringifyPayload(p);
    return s.length > 120 ? s.slice(0, 120) + "…" : s;
  } catch {
    return "message";
  }
}

function stringifyPayload(p: unknown): string {
  if (p == null) return "";
  if (typeof p === "string") return p;
  if (p instanceof Error) {
    return p.stack || p.message || String(p);
  }

  // React SyntheticEvent のような循環参照オブジェクトの簡易表現
  if (p && typeof p === "object") {
    const anyP = p as Record<string, unknown>;
    if (
      "nativeEvent" in anyP && typeof anyP["nativeEvent"] === "object" &&
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
    const NodeCtor: typeof Node | undefined =
      (globalThis as unknown as { Node?: typeof Node }).Node;
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
        Array.from((val as Map<unknown, unknown>).entries()),
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

function fmtTime(t: number) {
  const d = new Date(t);
  return d.toLocaleTimeString();
}

function inlineSnippet(s: string, max = 100): string {
  // 改行や連続空白を 1 つのスペースに畳み、指定長で省略
  const oneLine = s.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}

export default StreamConsole;
