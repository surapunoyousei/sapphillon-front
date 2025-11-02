import React from "react";
import {
    Box,
    Button,
    Card,
    createListCollection,
    Dialog,
    Flex,
    Heading,
    HStack,
    Input,
    Select,
    Spinner,
    Table,
    Text,
    VStack,
} from "@chakra-ui/react";
import {
    LuCalendar,
    LuCode,
    LuFileText,
    LuPlus,
    LuRefreshCw,
    LuSearch,
    LuSparkles,
    LuUpload,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useWorkflowsList } from "./useWorkflowsList";
import type {
    Workflow,
    WorkflowLanguage,
} from "@/gen/sapphillon/v1/workflow_pb";
import { WorkflowLanguage as WorkflowLanguageEnum } from "@/gen/sapphillon/v1/workflow_pb";
import {
    OrderByClauseSchema,
    OrderByDirection,
} from "@/gen/sapphillon/v1/workflow_service_pb";
import { create } from "@bufbuild/protobuf";

function formatDate(timestamp?: { seconds: bigint; nanos: number }): string {
    if (!timestamp) return "-";
    const date = new Date(Number(timestamp.seconds) * 1000);
    return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getLanguageLabel(language: WorkflowLanguage): string {
    switch (language) {
        case WorkflowLanguageEnum.TYPESCRIPT:
            return "TypeScript";
        case WorkflowLanguageEnum.JAVASCRIPT:
            return "JavaScript";
        default:
            return "Unknown";
    }
}

function WorkflowRow({ workflow }: { workflow: Workflow }) {
    const latestResult = workflow.workflowResults
        ?.[workflow.workflowResults.length - 1];

    return (
        <Table.Row>
            <Table.Cell>
                <VStack align="start" gap={1}>
                    <Text fontWeight="medium">
                        {workflow.displayName || "-"}
                    </Text>
                    {workflow.description && (
                        <Text
                            fontSize="sm"
                            color="fg.muted"
                            css={{
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {workflow.description}
                        </Text>
                    )}
                </VStack>
            </Table.Cell>
            <Table.Cell>
                <HStack gap={2}>
                    <LuCode size={16} />
                    <Text fontSize="sm">
                        {getLanguageLabel(workflow.workflowLanguage)}
                    </Text>
                </HStack>
            </Table.Cell>
            <Table.Cell>
                <Text fontSize="sm" color="fg.muted">
                    {workflow.workflowCode?.length || 0} revisions
                </Text>
            </Table.Cell>
            <Table.Cell>
                <HStack gap={1} color="fg.muted">
                    <LuCalendar size={14} />
                    <Text fontSize="sm">{formatDate(workflow.updatedAt)}</Text>
                </HStack>
            </Table.Cell>
            <Table.Cell>
                {latestResult
                    ? (
                        <HStack gap={2}>
                            <Box
                                w={2}
                                h={2}
                                rounded="full"
                                bg={latestResult.resultType === 0
                                    ? "green.500"
                                    : latestResult.resultType === 1
                                    ? "red.500"
                                    : "gray.500"}
                            />
                            <Text fontSize="sm" color="fg.muted">
                                {latestResult.resultType === 0
                                    ? "Success"
                                    : "Failed"}
                            </Text>
                        </HStack>
                    )
                    : (
                        <Text fontSize="sm" color="fg.muted">
                            No runs
                        </Text>
                    )}
            </Table.Cell>
            <Table.Cell>
                <HStack gap={2}>
                    <Button size="sm" variant="outline">
                        View
                    </Button>
                    <Button size="sm" variant="outline">
                        Run
                    </Button>
                </HStack>
            </Table.Cell>
        </Table.Row>
    );
}

export function WorkflowsPage() {
    const navigate = useNavigate();
    const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = React.useState(
        false,
    );

    const {
        workflows,
        loading,
        error,
        pageToken,
        nextPageToken,
        filter,
        setFilter,
        setOrderBy,
        refetch,
        loadNextPage,
    } = useWorkflowsList();

    const handleSearch = React.useCallback(
        (value: string) => {
            setFilter((prev) => ({
                ...prev,
                displayName: value,
            }));
        },
        [setFilter],
    );

    const handleLanguageFilter = React.useCallback(
        (value: string) => {
            setFilter((prev) => ({
                ...prev,
                workflowLanguage: value === "" ||
                        value === WorkflowLanguageEnum.UNSPECIFIED.toString()
                    ? WorkflowLanguageEnum.UNSPECIFIED
                    : Number(value),
            }));
        },
        [setFilter],
    );

    const languageCollection = React.useMemo(
        () =>
            createListCollection({
                items: [
                    {
                        value: WorkflowLanguageEnum.UNSPECIFIED.toString(),
                        label: "All Languages",
                    },
                    {
                        value: WorkflowLanguageEnum.TYPESCRIPT.toString(),
                        label: "TypeScript",
                    },
                    {
                        value: WorkflowLanguageEnum.JAVASCRIPT.toString(),
                        label: "JavaScript",
                    },
                ],
            }),
        [],
    );

    const handleSort = React.useCallback(
        (field: string) => {
            setOrderBy((prev) => {
                const existing = prev.findIndex((o) => o.field === field);
                if (existing >= 0) {
                    // Toggle direction
                    const newOrderBy = [...prev];
                    newOrderBy[existing] = create(OrderByClauseSchema, {
                        field: newOrderBy[existing].field,
                        direction: newOrderBy[existing].direction ===
                                OrderByDirection.ASC
                            ? OrderByDirection.DESC
                            : OrderByDirection.ASC,
                    });
                    return newOrderBy;
                }
                // Add new sort
                return [
                    ...prev,
                    create(OrderByClauseSchema, {
                        field,
                        direction: OrderByDirection.ASC,
                    }),
                ];
            });
        },
        [setOrderBy],
    );

    return (
        <Flex direction="column" h="full" overflow="hidden">
            {/* Header */}
            <Box
                borderBottomWidth="1px"
                borderBottomColor="border"
                px={{ base: 4, md: 6 }}
                py={4}
            >
                <Flex
                    justify="space-between"
                    align="center"
                    flexWrap="wrap"
                    gap={4}
                >
                    <Heading size="lg">Workflows</Heading>
                    <HStack gap={2}>
                        <Button
                            onClick={refetch}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                        >
                            <LuRefreshCw />
                            <Text>Refresh</Text>
                        </Button>
                        <Button
                            colorPalette="floorp"
                            size="sm"
                            onClick={() => setIsNewWorkflowModalOpen(true)}
                        >
                            <LuPlus />
                            <Text>New Workflow</Text>
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* Filters */}
            <Box
                borderBottomWidth="1px"
                borderBottomColor="border"
                px={{ base: 4, md: 6 }}
                py={3}
            >
                <HStack gap={3} flexWrap="wrap">
                    <HStack
                        borderWidth="1px"
                        rounded="md"
                        px={3}
                        py={1}
                        gap={2}
                        maxW="300px"
                        bg="bg"
                        _focusWithin={{
                            outline: "2px solid",
                            outlineColor: "accent.focusRing",
                            outlineOffset: "2px",
                        }}
                    >
                        <LuSearch
                            size={16}
                            color="var(--chakra-colors-fg-muted)"
                        />
                        <Input
                            placeholder="Search by name..."
                            value={filter.displayName || ""}
                            onChange={(e) => handleSearch(e.target.value)}
                            size="sm"
                            flex="1"
                            border="none"
                            outline="none"
                            bg="transparent"
                        />
                    </HStack>
                    <Select.Root
                        collection={languageCollection}
                        value={filter.workflowLanguage ===
                                WorkflowLanguageEnum.UNSPECIFIED
                            ? undefined
                            : [filter.workflowLanguage?.toString() || ""]}
                        onValueChange={(details) => {
                            const value = details.value?.[0];
                            handleLanguageFilter(value || "");
                        }}
                        size="sm"
                        maxW="200px"
                    >
                        <Select.Trigger>
                            <Select.ValueText placeholder="All Languages" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item
                                item={WorkflowLanguageEnum.UNSPECIFIED
                                    .toString()}
                            >
                                All Languages
                            </Select.Item>
                            <Select.Item
                                item={WorkflowLanguageEnum.TYPESCRIPT
                                    .toString()}
                            >
                                TypeScript
                            </Select.Item>
                            <Select.Item
                                item={WorkflowLanguageEnum.JAVASCRIPT
                                    .toString()}
                            >
                                JavaScript
                            </Select.Item>
                        </Select.Content>
                    </Select.Root>
                </HStack>
            </Box>

            {/* Content */}
            <Box flex="1" overflowY="auto" px={{ base: 4, md: 6 }} py={4}>
                {loading && workflows.length === 0
                    ? (
                        <Flex justify="center" align="center" h="200px">
                            <VStack gap={4}>
                                <Spinner size="lg" />
                                <Text color="fg.muted">
                                    Loading workflows...
                                </Text>
                            </VStack>
                        </Flex>
                    )
                    : error
                    ? (
                        <Card.Root>
                            <Card.Body>
                                <VStack gap={2}>
                                    <Text color="red.500" fontWeight="medium">
                                        Error loading workflows
                                    </Text>
                                    <Text fontSize="sm" color="fg.muted">
                                        {error instanceof Error
                                            ? error.message
                                            : String(error)}
                                    </Text>
                                    <Button
                                        onClick={refetch}
                                        size="sm"
                                        variant="outline"
                                    >
                                        Retry
                                    </Button>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    )
                    : workflows.length === 0
                    ? (
                        <Card.Root>
                            <Card.Body>
                                <VStack gap={4} py={8}>
                                    <LuFileText
                                        size={48}
                                        color="var(--chakra-colors-fg-muted)"
                                    />
                                    <VStack gap={2}>
                                        <Text fontWeight="medium" fontSize="lg">
                                            No workflows found
                                        </Text>
                                        <Text color="fg.muted" fontSize="sm">
                                            Create your first workflow to get
                                            started
                                        </Text>
                                    </VStack>
                                    <Button
                                        colorPalette="floorp"
                                        onClick={() =>
                                            setIsNewWorkflowModalOpen(true)}
                                    >
                                        <LuPlus />
                                        <Text>New Workflow</Text>
                                    </Button>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    )
                    : (
                        <Card.Root>
                            <Card.Body p={0}>
                                <Table.Root>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.ColumnHeader
                                                cursor="pointer"
                                                onClick={() =>
                                                    handleSort("display_name")}
                                            >
                                                Name
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader>
                                                Language
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader>
                                                Revisions
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader
                                                cursor="pointer"
                                                onClick={() =>
                                                    handleSort("updated_at")}
                                            >
                                                Updated
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader>
                                                Last Run
                                            </Table.ColumnHeader>
                                            <Table.ColumnHeader>
                                                Actions
                                            </Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {workflows.map((workflow) => (
                                            <WorkflowRow
                                                key={workflow.id}
                                                workflow={workflow}
                                            />
                                        ))}
                                    </Table.Body>
                                </Table.Root>
                            </Card.Body>
                        </Card.Root>
                    )}

                {/* Pagination */}
                {workflows.length > 0 && (
                    <Flex justify="space-between" align="center" mt={4} gap={4}>
                        <Text fontSize="sm" color="fg.muted">
                            Showing {workflows.length}{" "}
                            workflow{workflows.length !== 1 ? "s" : ""}
                            {nextPageToken && " (more available)"}
                        </Text>
                        <HStack gap={2}>
                            {pageToken && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        // Note: In a real implementation, you'd need to track previous page tokens
                                        // For now, this refetches the first page
                                        refetch();
                                    }}
                                >
                                    Previous
                                </Button>
                            )}
                            {nextPageToken && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={loadNextPage}
                                >
                                    Next
                                </Button>
                            )}
                        </HStack>
                    </Flex>
                )}
            </Box>

            {/* New Workflow Modal */}
            <Dialog.Root
                open={isNewWorkflowModalOpen}
                onOpenChange={(details) =>
                    setIsNewWorkflowModalOpen(details.open)}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content
                        maxW={{ base: "100vw", md: "600px" }}
                        w={{ base: "100vw", md: "auto" }}
                    >
                        <Dialog.Header>
                            <Heading size="md">Create New Workflow</Heading>
                        </Dialog.Header>
                        <Dialog.CloseTrigger />
                        <Dialog.Body>
                            <VStack gap={4} align="stretch" py={2}>
                                <Text color="fg.muted">
                                    Choose how you want to create a new
                                    workflow:
                                </Text>

                                <Card.Root
                                    cursor="pointer"
                                    _hover={{ bg: "bg.subtle" }}
                                    onClick={() => {
                                        setIsNewWorkflowModalOpen(false);
                                        navigate("/generate");
                                    }}
                                >
                                    <Card.Body>
                                        <HStack gap={3} align="start">
                                            <Box
                                                p={3}
                                                rounded="md"
                                                bg="blue.500"
                                                color="white"
                                                flexShrink={0}
                                            >
                                                <LuSparkles size={24} />
                                            </Box>
                                            <VStack
                                                align="start"
                                                gap={1}
                                                flex="1"
                                            >
                                                <Text
                                                    fontWeight="semibold"
                                                    fontSize="md"
                                                >
                                                    Generate
                                                </Text>
                                                <Text
                                                    fontSize="sm"
                                                    color="fg.muted"
                                                >
                                                    Generate a new workflow from
                                                    natural language description
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Card.Body>
                                </Card.Root>

                                <Card.Root
                                    opacity={0.6}
                                    cursor="not-allowed"
                                >
                                    <Card.Body>
                                        <HStack gap={3} align="start">
                                            <Box
                                                p={3}
                                                rounded="md"
                                                bg="gray.500"
                                                color="white"
                                                flexShrink={0}
                                            >
                                                <LuUpload size={24} />
                                            </Box>
                                            <VStack
                                                align="start"
                                                gap={1}
                                                flex="1"
                                            >
                                                <HStack gap={2} align="center">
                                                    <Text
                                                        fontWeight="semibold"
                                                        fontSize="md"
                                                    >
                                                        Import
                                                    </Text>
                                                    <Box
                                                        px={2}
                                                        py={0.5}
                                                        rounded="sm"
                                                        bg="orange.500"
                                                        fontSize="xs"
                                                        fontWeight="medium"
                                                        color="white"
                                                    >
                                                        Coming Soon
                                                    </Box>
                                                </HStack>
                                                <Text
                                                    fontSize="sm"
                                                    color="fg.muted"
                                                >
                                                    Import an existing workflow
                                                    from a file
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Card.Body>
                                </Card.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onClick={() => setIsNewWorkflowModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Flex>
    );
}
