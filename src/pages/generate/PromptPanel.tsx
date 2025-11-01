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
        <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Prompt</Text>
        <Spacer />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange("")}
          disabled={streaming}
          minH={{ base: "36px", md: "auto" }}
        >
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
            : <Text fontSize={{ base: "xs", sm: "sm" }}>Generate</Text>}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onStop}
          disabled={!streaming}
          minH={{ base: "36px", md: "auto" }}
        >
          <Text fontSize={{ base: "xs", sm: "sm" }}>Stop</Text>
        </Button>
      </HStack>
      <Textarea
        rows={{ base: 3, md: 4 }}
        resize="vertical"
        placeholder="Describe what you want to automate…"
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        fontSize={{ base: "sm", md: "md" }}
      />
    </VStack>
  );
}
