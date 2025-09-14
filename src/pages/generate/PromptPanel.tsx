import {
  Button,
  HStack,
  Spacer,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";

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
  return (
    <VStack align="stretch" gap={2}>
      <HStack gap={2} wrap="wrap">
        <Text fontWeight="medium">Prompt</Text>
        <Spacer />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange("")}
          disabled={streaming}
        >
          Clear
        </Button>
        <Button
          size="sm"
          colorPalette="floorp"
          onClick={onStart}
          disabled={!prompt.trim() || streaming}
        >
          {streaming
            ? (
              <HStack>
                <Spinner size="xs" />
                <Text>Generating…</Text>
              </HStack>
            )
            : <Text>Generate</Text>}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onStop}
          disabled={!streaming}
        >
          Stop
        </Button>
      </HStack>
      <Textarea
        rows={4}
        resize="vertical"
        placeholder="Describe what you want to automate…"
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
      />
    </VStack>
  );
}
