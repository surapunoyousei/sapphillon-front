import React from "react";
import {
    Box,
    Button,
    Card,
    Flex,
    Heading,
    HStack,
    Separator,
    Spinner,
    Tabs,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft, LuHistory, LuPlay } from "react-icons/lu";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { WorkflowExecutionTimeline } from "@/components/workflow/WorkflowExecutionTimeline";
import { StreamConsole } from "@/components/console";
import type { GenerationEvent } from "@/components/console/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { useWorkflow } from "./useWorkflow";
import { useWorkflowRun } from "./useWorkflowRun";
import type { RunEvent } from "./useWorkflowRun";

function RunPanel({
    running,
    events,
    workflow,
    runRes,
    onRun,
}: {
    running: boolean;
    events: RunEvent[];
    workflow: React.ComponentProps<typeof WorkflowCanvas>["workflow"] | null;
    runRes: ReturnType<typeof useWorkflowRun>["runRes"];
    onRun: () => void;
}) {
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
                <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
                    実行
                </Text>
                <HStack gap={2}>
                    <Text
                        fontSize="xs"
                        color={running ? "blue.500" : runRes ? "green.500" : "fg.muted"}
                        fontWeight="medium"
                    >
                        {running ? "実行中" : runRes ? "完了" : "待機中"}
                    </Text>
                    <Button
                        size="sm"
                        onClick={onRun}
                        disabled={!workflow || running}
                        minH={{ base: "36px", md: "auto" }}
                        colorPalette="floorp"
                    >
                        <LuPlay size={14} />
                        <Text fontSize={{ base: "xs", sm: "sm" }}>実行</Text>
                    </Button>
                </HStack>
            </HStack>
            <Separator my={{ base: 1, md: 2 }} />
            <Box minH={0} h="full" overflow="hidden">
                {events.length === 0 && !running && !runRes ? (
                    <EmptyState
                        icon={<LuPlay />}
                        title="ワークフローを実行していません"
                        description="「実行」ボタンをクリックして、ワークフローを実行してください。"
                    />
                ) : (
                    <StreamConsole
                        events={events as GenerationEvent[]}
                        streaming={running}
                    />
                )}
            </Box>
        </VStack>
    );
}

export function WorkflowRunPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { workflow, loading, error } = useWorkflow(id || "");
    const { running, events, runRes, runByDefinition, clearEvents } = useWorkflowRun();
    const [activeTab, setActiveTab] = React.useState<"workflow" | "run" | "history">("run");

    // 戻る先を決定（Home から来た場合は Home に戻る）
    const backPath = React.useMemo(() => {
        const state = location.state as { from?: string; autoRun?: boolean } | null;
        if (state?.from === "/home") {
            return "/home";
        }
        return `/workflows/${id}`;
    }, [location.state, id]);

    // 自動実行フラグを取得
    const shouldAutoRun = React.useMemo(() => {
        const state = location.state as { autoRun?: boolean } | null;
        return state?.autoRun === true;
    }, [location.state]);

    // 自動実行が有効で、ワークフローが読み込まれたら実行
    const hasAutoRunRef = React.useRef(false);
    React.useEffect(() => {
        if (
            shouldAutoRun &&
            !hasAutoRunRef.current &&
            workflow &&
            !loading &&
            !running &&
            workflow.workflowCode &&
            workflow.workflowCode.length > 0
        ) {
            hasAutoRunRef.current = true;
            clearEvents();
            runByDefinition(workflow);
        }
    }, [shouldAutoRun, workflow, loading, running, runByDefinition, clearEvents]);

    const latestCode = React.useMemo(() => {
        if (!workflow?.workflowCode || workflow.workflowCode.length === 0) {
            return null;
        }
        return workflow.workflowCode[workflow.workflowCode.length - 1];
    }, [workflow]);

    const handleRun = React.useCallback(() => {
        if (!workflow) return;
        clearEvents();
        runByDefinition(workflow);
    }, [workflow, runByDefinition, clearEvents]);

    if (loading) {
        return (
            <Flex h="full" align="center" justify="center">
                <VStack gap={4}>
                    <Spinner size="lg" />
                    <Text color="fg.muted">ワークフローを読み込み中...</Text>
                </VStack>
            </Flex>
        );
    }

    if (error || !workflow) {
        return (
            <Flex h="full" align="center" justify="center">
                <Card.Root>
                    <Card.Body>
                        <VStack gap={4}>
                            <Text color="red.500" fontWeight="medium">
                                ワークフローの読み込みに失敗しました
                            </Text>
                            <Text fontSize="sm" color="fg.muted">
                                {error instanceof Error
                                    ? error.message
                                    : String(error)}
                            </Text>
                            <Button onClick={() => navigate("/workflows")}>
                                ワークフロー一覧に戻る
                            </Button>
                        </VStack>
                    </Card.Body>
                </Card.Root>
            </Flex>
        );
    }

    return (
        <Flex direction="column" h="full" overflow="hidden">
            {/* Header */}
            <Box
                borderBottomWidth="1px"
                borderBottomColor="border"
                px={{ base: 4, md: 6 }}
                py={3}
                bg="bg.panel"
                zIndex={10}
            >
                <HStack justify="space-between" align="center">
                    <HStack gap={3}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(backPath)}
                        >
                            <LuArrowLeft />
                        </Button>
                        <VStack align="start" gap={0}>
                            <Heading size="md">
                                {workflow.displayName || "無題のワークフロー"} - 実行
                            </Heading>
                            {workflow.description && (
                                <Text fontSize="sm" color="fg.muted">
                                    {workflow.description}
                                </Text>
                            )}
                        </VStack>
                    </HStack>
                </HStack>
            </Box>

            {/* Main Content */}
            <Flex flex="1" overflow="hidden">
                <Box flex="1" overflow="hidden" position="relative">
                    <Tabs.Root
                        value={activeTab}
                        onValueChange={(e) =>
                            setActiveTab(e.value as "workflow" | "run" | "history")}
                        h="full"
                        display="flex"
                        flexDirection="column"
                    >
                        <Tabs.List borderBottomWidth="1px" flexShrink={0}>
                            <Tabs.Trigger value="workflow" px={4} py={2}>
                                <Text fontSize="sm">ワークフロー</Text>
                            </Tabs.Trigger>
                            <Tabs.Trigger value="run" px={4} py={2}>
                                <Text fontSize="sm">実行</Text>
                            </Tabs.Trigger>
                            <Tabs.Trigger value="history" px={4} py={2}>
                                <HStack gap={1}>
                                    <LuHistory size={14} />
                                    <Text fontSize="sm">実行履歴</Text>
                                    {workflow.workflowResults &&
                                        workflow.workflowResults.length > 0 && (
                                            <Box
                                                as="span"
                                                px={1.5}
                                                py={0.5}
                                                rounded="full"
                                                bg="blue.500"
                                                color="white"
                                                fontSize="2xs"
                                                fontWeight="medium"
                                            >
                                                {workflow.workflowResults.length}
                                            </Box>
                                        )}
                                </HStack>
                            </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content
                            value="workflow"
                            flex="1"
                            overflow="hidden"
                            p={0}
                        >
                            <Box h="full" overflow="auto" p={4}>
                                <WorkflowCanvas workflow={workflow} withBackground={true} />
                            </Box>
                        </Tabs.Content>

                        <Tabs.Content value="run" flex="1" overflow="auto" p={4}>
                            <RunPanel
                                running={running}
                                events={events}
                                workflow={workflow}
                                runRes={runRes}
                                onRun={handleRun}
                            />
                        </Tabs.Content>

                        <Tabs.Content value="history" flex="1" overflow="auto" p={4}>
                            <WorkflowExecutionTimeline
                                results={workflow.workflowResults || []}
                            />
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
            </Flex>
        </Flex>
    );
}

