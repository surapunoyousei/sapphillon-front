import {
  Badge,
  Button,
  HStack,
  Spacer,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { LuEraser, LuSparkles, LuSquare } from "react-icons/lu";
import React from "react";

export function PromptPanel(
  {
    prompt,
    onChange,
    onStart,
    onStop,
    streaming,
  }: {
    prompt: string;
    onChange: (v: string) => void;
    onStart: () => void;
    onStop: () => void;
    streaming: boolean;
  },
) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && prompt.trim() && !streaming) {
        e.preventDefault();
        onStart();
      }
    },
    [onStart, prompt, streaming]
  );

  const characterCount = prompt.length;

  return (
    <VStack align="stretch" gap={2}>
      <HStack gap={2} wrap="wrap">
        <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Prompt</Text>
        {characterCount > 0 && (
          <Badge colorPalette="gray" fontSize="xs">
            {characterCount} 文字
          </Badge>
        )}
        <Spacer />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange("")}
          disabled={streaming || !prompt}
          minH={{ base: "36px", md: "auto" }}
        >
          <LuEraser size={14} />
          <Text fontSize={{ base: "xs", sm: "sm" }}>Clear</Text>
        </Button>
        <Button
          size="sm"
          colorPalette="floorp"
          onClick={onStart}
          disabled={!prompt.trim() || streaming}
          minH={{ base: "36px", md: "auto" }}
        >
          {streaming
            ? (
              <HStack gap={1}>
                <Spinner size="xs" />
                <Text fontSize={{ base: "xs", sm: "sm" }}>Generating…</Text>
              </HStack>
            )
            : (
              <>
                <LuSparkles size={14} />
                <Text fontSize={{ base: "xs", sm: "sm" }}>Generate</Text>
              </>
            )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorPalette="red"
          onClick={onStop}
          disabled={!streaming}
          minH={{ base: "36px", md: "auto" }}
        >
          <LuSquare size={14} />
          <Text fontSize={{ base: "xs", sm: "sm" }}>Stop</Text>
        </Button>
      </HStack>
      <Textarea
        rows={{ base: 3, md: 4 }}
        resize="vertical"
        placeholder="例: 最新のレポートをダウンロードして、チームにメールで送信する"
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        fontSize={{ base: "sm", md: "md" }}
      />
      <Text fontSize="xs" color="fg.muted" textAlign="right">
        ⌘/Ctrl + Enter で実行
      </Text>
    </VStack>
  );
}
