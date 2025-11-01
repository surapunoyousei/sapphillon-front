import React from "react";
import {
  Badge,
  Box,
  Button,
  HStack,
  Text,
  Tooltip,
  Portal,
} from "@chakra-ui/react";
import { LuCheck, LuClipboard } from "react-icons/lu";
import type { GenerationEvent } from "./utils";
import { kindMeta } from "./kind-meta";
import { summarize } from "./row-utils";
import { stringifyPayload, inlineSnippet, fmtTime } from "./utils";

export interface LogRowProps {
  e: GenerationEvent;
  index: number;
}

export function LogRow({ e, index }: LogRowProps) {
  const meta = kindMeta(e);
  const summary = summarize(e);
  const payload = stringifyPayload(e.payload);
  const inline = payload ? inlineSnippet(payload, 100) : "";
  const copyText = payload ?? summary;
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = React.useCallback(async () => {
    if (!copyText) return;
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }, [copyText]);

  return (
    <Box
      px={{ base: 1, md: 2 }}
      py={{ base: 0.5, md: 1 }}
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
      <HStack gap={{ base: 0.5, md: 1 }} align="center" flexWrap="nowrap">
        <Badge
          colorPalette={meta.palette}
          flexShrink={0}
          fontSize="xs"
          px={{ base: 0.5, md: 1 }}
          py={0}
        >
          {e.kind}
        </Badge>
        <Text fontSize="xs" color="fg.muted" flexShrink={0} w={{ base: "48px", md: "72px" }} display={{ base: "none", sm: "block" }}>
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
                    fontSize={{ base: "xs", md: "sm" }}
                    css={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {summary}
                    {inline && (
                      <Text as="span" fontFamily="mono" color="fg.muted" display={{ base: "none", md: "inline" }}>
                        — {inline}
                      </Text>
                    )}
                  </Text>
                </Tooltip.Trigger>
                <Portal>
                  <Tooltip.Positioner>
                    <Tooltip.Content
                      maxW={{ base: "95vw", md: "90vw" }}
                      maxH={{ base: "40vh", md: "50vh" }}
                      overflow="auto"
                      p={{ base: 1.5, md: 2 }}
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
                fontSize={{ base: "xs", md: "sm" }}
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
        <Tooltip.Root
          open={copied ? true : undefined}
          positioning={{ placement: "top" }}
          openDelay={0}
          closeDelay={copied ? 600 : 100}
        >
          <Tooltip.Trigger asChild>
            <Button
              size="xs"
              variant="ghost"
              onClick={handleCopy}
              disabled={!copyText}
              aria-label={copied ? "Copied" : "Copy"}
              flexShrink={0}
              minH={{ base: "32px", md: "auto" }}
            >
              <Box
                as={copied ? LuCheck : LuClipboard}
                aria-hidden="true"
                css={{ width: 3, height: 3 }}
                sx={{
                  "@media (min-width: 768px)": {
                    width: 4,
                    height: 4,
                  },
                }}
              />
            </Button>
          </Tooltip.Trigger>
          <Portal>
            <Tooltip.Positioner>
              <Tooltip.Content fontSize="xs">
                <Tooltip.Arrow />
                {copied ? "Copied" : "Copy"}
              </Tooltip.Content>
            </Tooltip.Positioner>
          </Portal>
        </Tooltip.Root>
      </HStack>
    </Box>
  );
}

