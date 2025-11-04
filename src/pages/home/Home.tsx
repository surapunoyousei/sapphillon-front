import React from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  IconButton,
  Kbd,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LuPackage, LuPlay, LuSend, LuSparkles } from "react-icons/lu";
import { useWorkflowsList } from "@/pages/workflows/useWorkflowsList";
import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";
import { clients } from "@/lib/grpc-clients";
import { create } from "@bufbuild/protobuf";
import {
  RunWorkflowRequestSchema,
  WorkflowSourceByIdSchema,
} from "@/gen/sapphillon/v1/workflow_service_pb";
import { CardSkeleton } from "@/components/ui/skeleton";

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const [running, setRunning] = React.useState(false);
  const latestCode = workflow.workflowCode?.[workflow.workflowCode.length - 1];

  const handleRun = React.useCallback(async () => {
    if (!latestCode || running) return;

    setRunning(true);
    try {
      const request = create(RunWorkflowRequestSchema, {
        source: {
          case: "byId",
          value: create(WorkflowSourceByIdSchema, {
            workflowId: workflow.id,
            workflowCodeId: latestCode.id,
          }),
        },
      });

      await clients.workflow.runWorkflow(request);
      // TODO: 実行結果を表示する（Toastなど）
    } catch (error) {
      console.error("Failed to run workflow:", error);
      // TODO: エラーを表示する
    } finally {
      setRunning(false);
    }
  }, [workflow, latestCode, running]);

  return (
    <Card.Root
      cursor="pointer"
      _hover={{ borderColor: "border.emphasized", shadow: "md" }}
      transition="all 0.2s"
      onClick={handleRun}
    >
      <Card.Body p={4}>
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1} flex="1">
              <Text
                fontWeight="semibold"
                fontSize="md"
                css={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {workflow.displayName || "Untitled Workflow"}
              </Text>
              {workflow.description && (
                <Text
                  fontSize="sm"
                  color="fg.muted"
                  css={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {workflow.description}
                </Text>
              )}
            </VStack>
            <Button
              size="sm"
              colorPalette="floorp"
              onClick={(e) => {
                e.stopPropagation();
                handleRun();
              }}
              disabled={running || !latestCode}
            >
              {running ? <Spinner size="xs" /> : <LuPlay />}
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // ワークフロー一覧を取得
  const { workflows, loading } = useWorkflowsList();
  const hasWorkflows = workflows.length > 0;

  const handleSubmit = React.useCallback(() => {
    if (prompt.trim()) {
      navigate("/generate");
    }
  }, [prompt, navigate]);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  return (
    <Flex
      direction="column"
      h="full"
      minH={0}
      overflow="hidden"
      mx={{ base: -2, md: -4 }}
      mb={{ base: -2, md: -4 }}
      css={{
        height: "100%",
        "@media (max-height: 600px) and (orientation: landscape)": {
          minHeight: "auto",
        },
      }}
    >
      {/* Scrollable content area */}
      {!hasWorkflows
        ? (
          <Box
            flex="1"
            minH={0}
            overflowY="auto"
            overflowX="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={{ base: 3, sm: 4, md: 6 }}
            py={{ base: 4, sm: 6, md: 8 }}
          >
            <VStack
              w="full"
              maxW="3xl"
              margin="auto"
              gap={{ base: 6, sm: 7, md: 8 }}
              pb={{ base: 4, md: 6 }}
            >
              <VStack
                gap={{ base: 2, sm: 2.5, md: 3 }}
                textAlign="center"
                align="center"
                my="auto"
                pt={{ base: 4, md: 8 }}
              >
                <Heading
                  size={{ base: "xl", sm: "2xl", md: "3xl" }}
                  lineHeight="1.2"
                >
                  あなたが今やりたいことを代わりに実行する統合プラットフォーム
                </Heading>
                <Text
                  color="fg.muted"
                  fontSize={{ base: "sm", sm: "md", md: "lg" }}
                  px={{ base: 2, md: 0 }}
                >
                  Floorp OS
                  が、命令をあなたのように安全に実行し、結果を報告します。
                </Text>
              </VStack>

              {/* Quick actions */}
              <HStack
                gap={{ base: 2, md: 3 }}
                justify="center"
                flexWrap="wrap"
                w="full"
              >
                <Button
                  onClick={() => navigate("/generate")}
                  variant="surface"
                  size={{ base: "sm", md: "md" }}
                >
                  <LuSparkles />
                  <Text fontSize={{ base: "sm", md: "md" }}>Generate</Text>
                </Button>
                <Button
                  onClick={() => navigate("/workflows")}
                  variant="surface"
                  size={{ base: "sm", md: "md" }}
                >
                  <LuPlay />
                  <Text fontSize={{ base: "sm", md: "md" }}>Workflows</Text>
                </Button>
                <Button
                  onClick={() => navigate("/plugins")}
                  colorPalette="floorp"
                  size={{ base: "sm", md: "md" }}
                >
                  <LuPackage />
                  <Text fontSize={{ base: "sm", md: "md" }}>Plugins</Text>
                </Button>
              </HStack>
            </VStack>
          </Box>
        )
        : (
          <Box
            flex="1"
            minH={0}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            px={{ base: 3, sm: 4, md: 6 }}
            py={{ base: 3, sm: 4, md: 6 }}
          >
            <Box
              w="full"
              maxW="3xl"
              mx="auto"
              h="full"
              minH={0}
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <Heading
                size="md"
                textAlign="left"
                w="full"
                mb={4}
                flexShrink={0}
              >
                Recent Workflows
              </Heading>
              <Box
                flex="1"
                minH={0}
                overflowY="auto"
                overflowX="hidden"
                w="full"
              >
                {loading
                  ? (
                    <SimpleGrid
                      columns={{ base: 1, sm: 2, md: 3 }}
                      gap={4}
                      w="full"
                      pb={4}
                    >
                      {[...Array(6)].map((_, i) => (
                        <CardSkeleton key={i} />
                      ))}
                    </SimpleGrid>
                  )
                  : (
                    <SimpleGrid
                      columns={{ base: 1, sm: 2, md: 3 }}
                      gap={4}
                      w="full"
                      pb={4}
                    >
                      {workflows.map((workflow) => (
                        <WorkflowCard key={workflow.id} workflow={workflow} />
                      ))}
                    </SimpleGrid>
                  )}
              </Box>
            </Box>
          </Box>
        )}

      {/* Fixed bottom input bar - ChatGPT mobile style */}
      <Box
        w="full"
        flexShrink={0}
        borderTopWidth="1px"
        borderTopColor="border"
        bg="bg.panel"
        px={{ base: 3, sm: 4, md: 6 }}
        py={{ base: 3, md: 4 }}
        css={{
          "@media (max-height: 600px) and (orientation: landscape)": {
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          },
        }}
      >
        <Box
          maxW="3xl"
          mx="auto"
          borderWidth="1px"
          rounded="xl"
          p={{ base: 2, md: 3 }}
          bg="bg"
          shadow="sm"
        >
          <HStack gap={2} align="flex-end">
            <Textarea
              ref={textareaRef}
              placeholder="例: 最新のレポートをダウンロードして、チームにメールで送信する"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                // Cmd/Ctrl+Enter で送信（デスクトップ）
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                } // Enter キーで送信（モバイル、またはデスクトップで Shift なしの場合）
                // Shift+Enter は改行を許可
                else if (e.key === "Enter" && !e.shiftKey) {
                  // モバイルデバイスでは Enter で送信
                  // デスクトップでは Cmd+Enter を使うことを推奨
                  const isMobile = window.innerWidth < 768;
                  if (isMobile) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }
              }}
              rows={2}
              minH="120px"
              fontSize="md"
              resize="none"
              css={{
                "&": {
                  maxHeight: "240px",
                  overflowY: "auto",
                  lineHeight: "1.6",
                },
              }}
              flex="1"
            />
            <IconButton
              aria-label="Send"
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              colorPalette="floorp"
              size={{ base: "md", md: "lg" }}
              flexShrink={0}
              minH={{ base: "36px", md: "44px" }}
              minW={{ base: "36px", md: "44px" }}
            >
              <LuSend />
            </IconButton>
          </HStack>
          <HStack
            justify="space-between"
            mt={2}
            color="fg.muted"
            display={{ base: "none", sm: "flex" }}
          >
            <Text fontSize={{ base: "xs", md: "sm" }}>
              <Kbd fontSize={{ base: "xs", md: "sm" }}>⌘</Kbd> +{" "}
              <Kbd fontSize={{ base: "xs", md: "sm" }}>Enter</Kbd> で送信
            </Text>
          </HStack>
        </Box>
      </Box>
    </Flex>
  );
}
