import {
  Badge,
  Box,
  Button,
  HStack,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { RunWorkflowResponse } from "@/gen/sapphillon/v1/workflow_service_pb";
import { StreamConsole } from "@/components/console";

export type GenerationEvent = {
  t: number;
  kind: "message" | "error" | "done";
  payload?: unknown;
};

export function RunPanel(
  {
    streaming,
    events,
    latestDefinition,
    runRes,
    onRun,
  }: {
    streaming: boolean;
    events: GenerationEvent[];
    latestDefinition?: unknown;
    runRes: RunWorkflowResponse | null;
    onRun: () => void;
  },
) {
  return (
    <VStack
      align="stretch"
      gap={1}
      p={{ base: 1.5, md: 2 }}
      borderWidth="1px"
      bg="bg"
      rounded="md"
      h="full"
      minH={0}
      display="grid"
      gridTemplateRows="auto minmax(0, 1fr)"
      overflow="hidden"
    >
      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Run</Text>
        <HStack gap={2}>
          <Badge
            colorPalette={streaming ? "yellow" : runRes ? "green" : "gray"}
            fontSize="xs"
            px={{ base: 1, md: 2 }}
          >
            {streaming ? "streaming" : runRes ? "done" : "idle"}
          </Badge>
          <Button
            size="sm"
            onClick={onRun}
            disabled={!latestDefinition}
            minH={{ base: "36px", md: "auto" }}
          >
            <Text fontSize={{ base: "xs", sm: "sm" }}>Run</Text>
          </Button>
        </HStack>
      </HStack>
      <Separator my={{ base: 1, md: 2 }} />
      <Box minH={0} h="full" overflow="hidden">
        <StreamConsole events={events} streaming={streaming} />
      </Box>
    </VStack>
  );
}
