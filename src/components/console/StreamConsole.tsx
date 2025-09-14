import React from "react";
import { Badge, Box, Code, HStack, Text, VStack } from "@chakra-ui/react";
// icons removed to avoid bundle size / naming issues; using badge + border colors

export type GenerationEvent = {
    t: number;
    kind: "message" | "error" | "done";
    payload?: unknown;
};

type Props = { events: GenerationEvent[]; streaming: boolean };

export const StreamConsole: React.FC<Props> = ({ events, streaming }) => {
    const [autoScroll, setAutoScroll] = React.useState(true);
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const visible = events;

    // Auto scroll behavior
    React.useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const nearBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
        if (autoScroll && nearBottom) {
            el.scrollTop = el.scrollHeight;
        }
    }, [visible, autoScroll]);

    const onScroll = () => {
      const el = viewportRef.current;
      if (!el) return;
      const nearBottom =
          el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
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
            >
                {visible.length === 0
                    ? (
                        <Text color="fg.muted" px={2}>
                            {events.length === 0
                                ? (streaming
                                    ? "Streaming…"
                                    : "Waiting for run…")
                                : "No matches"}
                        </Text>
                    )
                    : (
                        rows.map((r, i) => r.type === "sep" ? <SeparatorRow key={`s-${i}`} label={r.label} /> : <LogRow key={`l-${i}`} e={r.event} index={i} />)
                    )}
            </Box>
        </VStack>
    );
};

function LogRow({ e, index }: { e: GenerationEvent; index: number }) {
  const meta = kindMeta(e);
  const summary = summarize(e);
  const payload = stringifyPayload(e.payload);
  return (
    <Box
      px={2}
      py={1.5}
      borderBottomWidth="1px"
      borderColor="border"
      bg={index % 2 === 1 ? "bg.subtle" : undefined}
      position="relative"
      _hover={{ bg: "bg.muted" }}
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="1.5px" bg={meta.border} />
      <HStack gap={2} align="start">
        <Badge colorPalette={meta.palette} flexShrink={0}>
          {e.kind}
        </Badge>
        <Text fontSize="sm" color="fg.muted" flexShrink={0} w="84px">
          {fmtTime(e.t)}
        </Text>
        <Box flex={1} minW={0}>
          <Text fontSize="sm" css={{ wordBreak: "break-word" }}>{summary}</Text>
          {payload && (
            <details>
              <summary>
                <Text as="span" fontSize="xs" color="fg.muted">details</Text>
              </summary>
              <Code
                as="pre"
                display="block"
                p={2}
                fontSize="xs"
                whiteSpace="pre-wrap"
                css={{ overflowWrap: "anywhere" }}
                overflowX="auto"
              >
                {payload}
              </Code>
            </details>
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
      const p: any = e.payload;
      if (p && typeof p === "object" && p.stage === "run" && p.status === "start") {
        rows.push({ type: "sep", label: "Run started" });
      }
    }
    if (e.kind === "done") {
      const stage = (e.payload as any)?.stage;
      if (stage === "run") rows.push({ type: "sep", label: "Run completed" });
      if (stage === "generate") rows.push({ type: "sep", label: "Generation completed" });
    }
    rows.push({ type: "log", event: e });
  }
  return rows;
}

function SeparatorRow({ label }: { label: string }) {
  return (
    <HStack align="center" my={1} px={1} color="fg.muted">
      <Box flex="1" borderTopWidth="1px" borderColor="border" />
      <Text fontSize="xs" px={2} whiteSpace="nowrap">{label}</Text>
      <Box flex="1" borderTopWidth="1px" borderColor="border" />
    </HStack>
  );
}

function summarize(e: GenerationEvent): string {
  if (e.kind === "error") {
    const err = e.payload as unknown;
    const msg = typeof err === "object" && err && "message" in err ? (err as any).message : String(err);
    return msg || "Error";
  }
  if (e.kind === "done") {
    const stage = (e.payload as any)?.stage;
    if (stage === "run") return "Run completed";
    if (stage === "generate") return "Generation completed";
    return "Done";
  }
  // message
  const p: any = e.payload as any;
  if (p && typeof p === "object") {
    if (p.stage === "run" && p.status === "start") return "Run started";
    if (p.workflowResult) {
      const r = p.workflowResult;
      const name = r?.displayName || r?.id || "Run";
      const type = r?.resultType === 1 ? "FAILURE" : "SUCCESS";
      const exit = typeof r?.exitCode === "number" ? `, exit ${r.exitCode}` : "";
      // Prefer textual result if present
      if (typeof r?.result === "string" && r.result.trim()) {
        const txt = r.result.trim();
        return txt.length > 160 ? txt.slice(0, 160) + "…" : txt;
      }
      return `${name}: ${type}${exit}`;
    }
    if (p.workflowDefinition) return "Updated workflow definition";
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
    if (p instanceof Error) return p.stack || p.message || String(p);
    if (typeof p === "string") return p;
    try {
        return JSON.stringify(p, null, 2);
    } catch {
        return String(p);
    }
}

function fmtTime(t: number) {
    const d = new Date(t);
    return d.toLocaleTimeString();
}

export default StreamConsole;
