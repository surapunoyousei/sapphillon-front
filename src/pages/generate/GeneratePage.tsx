import React from "react";
import {
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
  Separator,
  Tabs,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { PromptPanel } from "./PromptPanel";
import { PluginsPanel } from "./PluginsPanel";
import { RunPanel } from "./RunPanel";
import { usePaneLayout } from "./usePaneLayout";
import { useWorkflowGeneration } from "./useWorkflowGeneration";
import { WorkflowCanvas } from "@/components/workflow";
import { LuExpand } from "react-icons/lu";

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
  const { open, onOpen, onClose } = useDisclosure();

  const onStart = React.useCallback(() => start(prompt), [start, prompt]);

  // モバイル・タブレット用のタブ表示
  const MobileLayout = () => (
    <VStack
      align="stretch"
      gap={2}
      h="full"
      minH={0}
      css={{
        "@media (max-height: 600px) and (orientation: landscape)": {
          gap: "0.5rem",
        },
      }}
    >
      <Box
        p={{ base: 2, md: 3 }}
        borderWidth="1px"
        bg="bg"
        rounded="md"
        css={{
          "@media (max-height: 600px) and (orientation: landscape)": {
            padding: "0.5rem",
          },
        }}
      >
        <PromptPanel
          prompt={prompt}
          onChange={setPrompt}
          onStart={onStart}
          onStop={stop}
          streaming={streaming}
        />
      </Box>

      <Tabs.Root
        defaultValue="workflow"
        flex={1}
        minH={0}
        display="flex"
        flexDirection="column"
      >
        <Tabs.List bg="bg" borderWidth="1px" borderRadius="md" p={1}>
          <Tabs.Trigger value="workflow" flex={1}>
            <Text fontSize={{ base: "xs", sm: "sm" }}>Workflow</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="plugins" flex={1}>
            <Text fontSize={{ base: "xs", sm: "sm" }}>Plugins</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="run" flex={1}>
            <Text fontSize={{ base: "xs", sm: "sm" }}>Run</Text>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content
          value="workflow"
          p={0}
          mt={2}
          flex={1}
          minH={0}
          overflow="hidden"
        >
          <VStack align="stretch" gap={2} h="full" minH={0}>
            <HStack justify="space-between" px={2}>
              <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                Workflow Steps
              </Text>
              <IconButton
                aria-label="Expand workflow"
                size="sm"
                variant="ghost"
                onClick={onOpen}
                disabled={!latest?.workflowDefinition}
                minH={{ base: "36px", md: "auto" }}
              >
                <LuExpand />
              </IconButton>
            </HStack>
            <Box
              flex={1}
              minH={0}
              borderWidth="1px"
              rounded="md"
              bg="bg.subtle"
              overflow="hidden"
            >
              {latest?.workflowDefinition && (
                <WorkflowCanvas workflow={latest.workflowDefinition} />
              )}
            </Box>
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="plugins" p={0} mt={2} flex={1} minH={0}>
          <PluginsPanel />
        </Tabs.Content>

        <Tabs.Content value="run" p={0} mt={2} flex={1} minH={0}>
          <RunPanel
            streaming={streaming}
            events={events}
            latestDefinition={latest?.workflowDefinition}
            runRes={runRes}
            onRun={runLatest}
          />
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  );

  // デスクトップ用のグリッドレイアウト
  const DesktopLayout = () => (
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
        p={{ base: 2, md: 3 }}
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
                <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                  Workflow Steps
                </Text>
                <IconButton
                  aria-label="Expand workflow"
                  size="sm"
                  variant="ghost"
                  onClick={onOpen}
                  disabled={!latest?.workflowDefinition}
                  minH={{ base: "36px", md: "auto" }}
                >
                  <LuExpand />
                </IconButton>
              </HStack>
              <Box
                minH={0}
                h="full"
                borderWidth="1px"
                rounded="md"
                bg="bg.subtle"
                overflow="hidden"
              >
                {latest?.workflowDefinition && (
                  <WorkflowCanvas workflow={latest.workflowDefinition} />
                )}
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

  return (
    <>
      {/* モバイル・タブレット表示 (lg未満) */}
      <Box
        display={{ base: "block", lg: "none" }}
        h="full"
        minH={0}
        overflow="hidden"
      >
        <MobileLayout />
      </Box>

      {/* デスクトップ表示 (lg以上) */}
      <Box
        display={{ base: "none", lg: "block" }}
        h="full"
        minH={0}
        overflow="hidden"
      >
        <DesktopLayout />
      </Box>

      <Dialog.Root
        open={open}
        onOpenChange={(e) => !e.open && onClose()}
        size={{ base: "full", md: "xl" }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW={{ base: "100vw", md: "90vw" }}
            maxH={{ base: "100vh", md: "90vh" }}
          >
            <Dialog.Header>
              <Text fontWeight="medium" fontSize={{ base: "md", md: "lg" }}>
                Workflow
              </Text>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body
              minH={{ base: "60vh", md: "70vh" }}
              p={0}
              padding={{ base: 2, md: 4 }}
              display="flex"
              flexDir="column"
            >
              {latest?.workflowDefinition && (
                <WorkflowCanvas workflow={latest.workflowDefinition} />
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={onClose} size={{ base: "sm", md: "md" }}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}

export default GeneratePage;
