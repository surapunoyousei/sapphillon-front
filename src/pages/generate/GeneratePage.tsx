import React from "react";
import { Box, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import { PromptPanel } from "./PromptPanel";
import { PluginsPanel } from "./PluginsPanel";
import { RunPanel } from "./RunPanel";
import { usePaneLayout } from "./usePaneLayout";
import { useWorkflowGeneration } from "./useWorkflowGeneration";
import WorkflowCanvas from "../../components/workflow/WorkflowCanvas";

export function GeneratePage() {
  const [prompt, setPrompt] = React.useState("");
  const {
    gridCols,
    gridRows,
    beginDrag,
    onGutterKeyDown,
    MIN_RIGHT,
    MIN_BOTTOM,
  } = usePaneLayout();
  const { streaming, events, latest, runRes, start, stop, runLatest } =
    useWorkflowGeneration();

  const onStart = React.useCallback(() => start(prompt), [start, prompt]);

  return (
    <Box
      display="grid"
      gridTemplateColumns={gridCols}
      gridTemplateRows={gridRows}
      h="full"
      minH={0}
      overflow="hidden"
      gap={0}
    >
      {/* Center: Prompt + Latest Definition */}
      <VStack
        align="stretch"
        gap={2}
        p={3}
        borderWidth="1px"
        bg="bg"
        rounded="md"
        gridColumn={1}
        gridRow={1}
        minW={0}
        minH={0}
        display="grid"
        gridTemplateRows="minmax(0, 1fr)"
        overflow="hidden"
      >
        <Box minH={0} h="full" overflowY="auto">
          <VStack align="stretch" h="full" gap={2}>
            <PromptPanel
              prompt={prompt}
              onChange={setPrompt}
              onStart={onStart}
              onStop={stop}
              streaming={streaming}
            />
            <Separator />
            <VStack
              align="stretch"
              gap={2}
              minH={0}
              h="full"
              display="grid"
              gridTemplateRows="auto minmax(0, 1fr)"
              overflow="hidden"
            >
              <HStack justify="space-between" mb={1}>
                <Text fontWeight="medium">Latest Definition</Text>
              </HStack>
              <Box
                minH={0}
                h="full"
                borderWidth="1px"
                rounded="md"
                bg="bg.subtle"
                overflow="hidden"
              >
                <WorkflowCanvas workflow={latest?.workflowDefinition ?? null} />
              </Box>
            </VStack>
          </VStack>
        </Box>
      </VStack>

      {/* Vertical gutter */}
      <Box
        gridColumn={2}
        gridRow={1}
        onMouseDown={beginDrag("right")}
        onKeyDown={onGutterKeyDown("right")}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize right pane"
        tabIndex={0}
        cursor="col-resize"
        _hover={{ bg: "border" }}
      />

      {/* Right: Plugins */}
      <Box gridColumn={3} gridRow={1} minW={MIN_RIGHT} minH={0} h="full">
        <PluginsPanel />
      </Box>

      {/* Horizontal gutter */}
      <Box
        gridColumn="1 / span 3"
        gridRow={2}
        onMouseDown={beginDrag("bottom")}
        onKeyDown={onGutterKeyDown("bottom")}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize run panel"
        tabIndex={0}
        cursor="row-resize"
        _hover={{ bg: "border" }}
      />

      {/* Bottom: Run panel */}
      <Box gridColumn="1 / span 3" gridRow={3} minH={MIN_BOTTOM} h="full">
        <RunPanel
          streaming={streaming}
          events={events}
          latestDefinition={latest?.workflowDefinition}
          runRes={runRes}
          onRun={runLatest}
        />
      </Box>
    </Box>
  );
}

export default GeneratePage;
