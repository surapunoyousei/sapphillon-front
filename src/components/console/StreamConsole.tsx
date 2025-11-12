import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import type { GenerationEvent } from "./utils";
import { toRows } from "./row-utils";
import { LogRow } from "./LogRow";
import { SeparatorRow } from "./SeparatorRow";
import { useI18n } from "@/hooks/useI18n";

export interface StreamConsoleProps {
  events: GenerationEvent[];
  streaming: boolean;
}

export const StreamConsole: React.FC<StreamConsoleProps> = ({
  events,
  streaming,
}) => {
  const { t } = useI18n();
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
        pr={{ base: 0.5, md: 1 }}
        fontFamily="mono"
        css={{ overflowAnchor: "none" }}
        className="scroll-container"
      >
        {visible.length === 0
          ? (
            <Text
              color="fg.muted"
              px={{ base: 1, md: 2 }}
              fontSize={{ base: "xs", md: "sm" }}
            >
              {events.length === 0
                ? (streaming ? t("console.running") : t("console.waiting"))
                : t("console.noLogs")}
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
