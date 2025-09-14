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
import { LuPlay } from "react-icons/lu";
import StreamConsole from "@/components/console/StreamConsole";

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
      p={2}
      borderWidth="1px"
      bg="bg"
      rounded="md"
      h="full"
      minH={0}
      display="grid"
      gridTemplateRows="auto minmax(0, 1fr)"
      overflow="hidden"
    >
      <HStack justify="space-between">
        <Text fontWeight="medium">Run</Text>
        <HStack gap={2}>
          <Badge
            colorPalette={streaming ? "yellow" : runRes ? "green" : "gray"}
          >
            {streaming ? "streaming" : runRes ? "done" : "idle"}
          </Badge>
          <Button size="sm" onClick={onRun} disabled={!latestDefinition}>
            <HStack>
              <Box as={LuPlay} css={{ width: 6, height: 6 }} />
              <Text>Run</Text>
            </HStack>
          </Button>
        </HStack>
      </HStack>
      <Separator my={2} />
      <Box minH={0} h="full" overflow="hidden">
        <StreamConsole events={events} streaming={streaming} />
      </Box>
    </VStack>
  );
}
