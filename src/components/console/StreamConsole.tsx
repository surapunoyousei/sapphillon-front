import React from "react";
import { Badge, Box, Code, HStack, Text, VStack } from "@chakra-ui/react";

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
                        visible.map((e, i) => <LogRow key={i} e={e} />)
                    )}
            </Box>
        </VStack>
    );
};

function LogRow({ e }: { e: GenerationEvent }) {
    const badgePalette = e.kind === "message"
        ? "floorp"
        : e.kind === "error"
        ? "red"
        : "gray";
    const summary = summarize(e);
    const payload = stringifyPayload(e.payload);
    return (
        <Box
            px={2}
            py={1}
            _hover={{ bg: "bg.subtle" }}
            borderBottomWidth="1px"
            borderColor="border"
        >
            <HStack gap={2} align="start">
                <Badge colorPalette={badgePalette} flexShrink={0}>
                    {e.kind}
                </Badge>
                <Text fontSize="sm" color="fg.muted" flexShrink={0} w="84px">
                    {fmtTime(e.t)}
                </Text>
                <Box flex={1} minW={0}>
                    <Text fontSize="sm">{summary}</Text>
                    {payload && (
                        <details>
                            <summary>
                                <Text as="span" fontSize="xs" color="fg.muted">
                                    details
                                </Text>
                            </summary>
                            <Code
                                as="pre"
                                display="block"
                                p={2}
                                fontSize="xs"
                                whiteSpace="pre"
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

function summarize(e: GenerationEvent): string {
    if (e.kind === "error") {
        const err = e.payload as Error | string | undefined;
        const msg = err?.message || String(err);
        return msg || "Error";
    }
    if (e.kind === "done") return "Generation completed";
    // message
    const p = e.payload;
    if (p && typeof p === "object" && p.workflowDefinition) {
        return "Updated workflow definition";
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
