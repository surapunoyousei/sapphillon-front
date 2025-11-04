import React from "react";
import {
    Badge,
    Box,
    Button,
    Card,
    Flex,
    Heading,
    HStack,
    IconButton,
    Spinner,
    Tabs,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
    LuArrowLeft,
    LuChevronDown,
    LuChevronRight,
    LuHistory,
    LuInfo,
    LuPlugZap,
    LuShield,
} from "react-icons/lu";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { WorkflowExecutionTimeline } from "@/components/workflow/WorkflowExecutionTimeline";
import { useWorkflow } from "./useWorkflow";
import type { PluginPackage } from "@/gen/sapphillon/v1/plugin_pb";
import type {
    AllowedPermission,
    Permission,
} from "@/gen/sapphillon/v1/permission_pb";
import {
    PermissionLevel,
    PermissionType,
} from "@/gen/sapphillon/v1/permission_pb";

function getPermissionTypeLabel(type: PermissionType): string {
    switch (type) {
        case PermissionType.EXECUTE:
            return "Execute";
        case PermissionType.FILESYSTEM_READ:
            return "Read Files";
        case PermissionType.FILESYSTEM_WRITE:
            return "Write Files";
        case PermissionType.NET_ACCESS:
            return "Network Access";
        case PermissionType.ALLOW_MCP:
            return "MCP Access";
        case PermissionType.ALLOW_ALL:
            return "All Permissions";
        default:
            return "Unknown";
    }
}

function getPermissionLevelColor(level: PermissionLevel): string {
    switch (level) {
        case PermissionLevel.MEDIUM:
            return "yellow";
        case PermissionLevel.HIGH:
            return "orange";
        case PermissionLevel.CRITICAL:
            return "red";
        default:
            return "gray";
    }
}

function PermissionItem({ permission }: { permission: Permission }) {
    return (
        <Box
            px={2}
            py={1}
            rounded="sm"
            bg="bg.subtle"
            borderLeftWidth="2px"
            borderLeftColor={`${
                getPermissionLevelColor(permission.permissionLevel)
            }.500`}
        >
            <HStack justify="space-between" gap={1}>
                <Text fontSize="xs" fontWeight="medium" flex="1">
                    {getPermissionTypeLabel(permission.permissionType)}
                </Text>
                <Badge
                    size="xs"
                    colorPalette={getPermissionLevelColor(
                        permission.permissionLevel,
                    )}
                >
                    {permission.permissionLevel === PermissionLevel.MEDIUM
                        ? "Medium"
                        : permission.permissionLevel ===
                                PermissionLevel.HIGH
                        ? "High"
                        : permission.permissionLevel ===
                                PermissionLevel.CRITICAL
                        ? "Critical"
                        : "Low"}
                </Badge>
            </HStack>
            {permission.resource && permission.resource.length > 0 && (
                <Text fontSize="2xs" color="fg.muted" mt={0.5}>
                    {permission.resource.join(", ")}
                </Text>
            )}
        </Box>
    );
}

function AllowedPermissionItem(
    { allowedPermission }: { allowedPermission: AllowedPermission },
) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <Box>
            <HStack
                px={2}
                py={1}
                bg="bg.subtle"
                rounded="sm"
                cursor="pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                _hover={{ bg: "bg.muted" }}
                justify="space-between"
                gap={1}
            >
                <Text fontSize="xs" fontWeight="medium" flex="1" truncate>
                    {allowedPermission.pluginFunctionId}
                </Text>
                <HStack gap={1}>
                    {allowedPermission.permissions &&
                        allowedPermission.permissions.length > 0 && (
                        <Badge size="xs" colorPalette="blue">
                            {allowedPermission.permissions.length}
                        </Badge>
                    )}
                    {isExpanded
                        ? <LuChevronDown size={14} />
                        : <LuChevronRight size={14} />}
                </HStack>
            </HStack>
            {isExpanded && allowedPermission.permissions &&
                allowedPermission.permissions.length > 0 && (
                <VStack align="stretch" gap={1} mt={1} ml={2}>
                    {allowedPermission.permissions.map((
                        permission,
                        idx,
                    ) => (
                        <PermissionItem
                            key={idx}
                            permission={permission}
                        />
                    ))}
                </VStack>
            )}
        </Box>
    );
}

function PluginInfo({ plugin }: { plugin: PluginPackage }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <Box>
            <HStack
                px={2}
                py={1}
                bg="bg.subtle"
                rounded="sm"
                cursor="pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                _hover={{ bg: "bg.muted" }}
                justify="space-between"
                gap={1}
            >
                <VStack align="start" gap={0} flex="1" minW={0}>
                    <Text fontSize="xs" fontWeight="medium" truncate>
                        {plugin.packageName}
                    </Text>
                    <Text fontSize="2xs" color="fg.muted">
                        v{plugin.packageVersion}
                    </Text>
                </VStack>
                <HStack gap={1} flexShrink={0}>
                    {plugin.functions && plugin.functions.length > 0 && (
                        <Badge size="xs" colorPalette="purple">
                            {plugin.functions.length}
                        </Badge>
                    )}
                    {isExpanded
                        ? <LuChevronDown size={14} />
                        : <LuChevronRight size={14} />}
                </HStack>
            </HStack>
            {isExpanded && (
                <VStack align="stretch" gap={1} mt={1} ml={2}>
                    {plugin.description && (
                        <Text fontSize="2xs" color="fg.muted" px={2}>
                            {plugin.description}
                        </Text>
                    )}
                    {plugin.functions && plugin.functions.length > 0 && (
                        <VStack align="stretch" gap={0.5}>
                            {plugin.functions.map((func) => (
                                <Box
                                    key={func.functionId}
                                    px={2}
                                    py={1}
                                    rounded="sm"
                                    bg="bg.muted"
                                    fontSize="2xs"
                                >
                                    {func.functionName || func.functionId}
                                </Box>
                            ))}
                        </VStack>
                    )}
                </VStack>
            )}
        </Box>
    );
}

export function WorkflowViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { workflow, loading, error } = useWorkflow(id || "");
    const [isPanelOpen, setIsPanelOpen] = React.useState(true);

    const latestCode = React.useMemo(() => {
        if (!workflow?.workflowCode || workflow.workflowCode.length === 0) {
            return null;
        }
        return workflow.workflowCode[workflow.workflowCode.length - 1];
    }, [workflow]);

    const plugins = React.useMemo(() => {
        if (!latestCode?.pluginPackages) return [];
        return latestCode.pluginPackages;
    }, [latestCode]);

    const permissions = React.useMemo(() => {
        if (!latestCode?.allowedPermissions) return [];
        return latestCode.allowedPermissions;
    }, [latestCode]);

    const pluginFunctionIds = React.useMemo(() => {
        if (!latestCode?.pluginFunctionIds) return [];
        return latestCode.pluginFunctionIds;
    }, [latestCode]);

    const hasInfo = plugins.length > 0 || pluginFunctionIds.length > 0 ||
        permissions.length > 0;

    if (loading) {
        return (
            <Flex h="full" align="center" justify="center">
                <VStack gap={4}>
                    <Spinner size="lg" />
                    <Text color="fg.muted">Loading workflow...</Text>
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
                                Error loading workflow
                            </Text>
                            <Text fontSize="sm" color="fg.muted">
                                {error instanceof Error
                                    ? error.message
                                    : String(error)}
                            </Text>
                            <Button onClick={() => navigate("/workflows")}>
                                Back to Workflows
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
                            onClick={() => navigate("/workflows")}
                        >
                            <LuArrowLeft />
                        </Button>
                        <VStack align="start" gap={0}>
                            <Heading size="md">
                                {workflow.displayName || "Untitled Workflow"}
                            </Heading>
                            {workflow.description && (
                                <Text fontSize="sm" color="fg.muted">
                                    {workflow.description}
                                </Text>
                            )}
                        </VStack>
                    </HStack>
                    {hasInfo && (
                        <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsPanelOpen(!isPanelOpen)}
                            aria-label="Toggle sidebar"
                            display={{ base: "none", lg: "flex" }}
                        >
                            <LuInfo />
                        </IconButton>
                    )}
                </HStack>
            </Box>

            {/* Main Content */}
            <Flex flex="1" overflow="hidden">
                {/* Canvas/Timeline Area */}
                <Box flex="1" overflow="hidden" position="relative">
                    <Tabs.Root defaultValue="canvas" h="full" display="flex" flexDirection="column">
                        <Tabs.List borderBottomWidth="1px" flexShrink={0}>
                            <Tabs.Trigger value="canvas" px={4} py={2}>
                                <Text fontSize="sm">ワークフロー</Text>
                            </Tabs.Trigger>
                            <Tabs.Trigger value="history" px={4} py={2}>
                                <HStack gap={1}>
                                    <LuHistory size={14} />
                                    <Text fontSize="sm">実行履歴</Text>
                                    {workflow.workflowResults && workflow.workflowResults.length > 0 && (
                                        <Badge size="xs" colorPalette="blue">
                                            {workflow.workflowResults.length}
                                        </Badge>
                                    )}
                                </HStack>
                            </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="canvas" flex="1" overflow="hidden" p={0}>
                            <WorkflowCanvas workflow={workflow} withBackground={true} />
                        </Tabs.Content>

                        <Tabs.Content value="history" flex="1" overflow="auto" p={4}>
                            <WorkflowExecutionTimeline
                                results={workflow.workflowResults || []}
                            />
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>

                {/* Right Sidebar */}
                {hasInfo && isPanelOpen && (
                    <Box
                        w={{ base: "280px", xl: "320px" }}
                        borderLeftWidth="1px"
                        borderLeftColor="border"
                        bg="bg.panel"
                        overflow="hidden"
                        display={{ base: "none", lg: "flex" }}
                        flexDirection="column"
                    >
                        {/* Sidebar Header */}
                        <Box
                            px={4}
                            py={3}
                            borderBottomWidth="1px"
                            borderBottomColor="border"
                        >
                            <Heading size="sm">ワークフロー情報</Heading>
                        </Box>

                        <Tabs.Root
                            defaultValue="overview"
                            size="sm"
                            variant="enclosed"
                            fitted
                            h="full"
                            display="flex"
                            flexDirection="column"
                        >
                            <Tabs.List
                                borderBottomWidth="1px"
                                borderBottomColor="border"
                                flexShrink={0}
                            >
                                <Tabs.Trigger
                                    value="overview"
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                >
                                    Overview
                                </Tabs.Trigger>
                                {plugins.length > 0 && (
                                    <Tabs.Trigger
                                        value="plugins"
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                    >
                                        <HStack gap={1}>
                                            <Text>Plugins</Text>
                                            <Badge
                                                size="xs"
                                                fontSize="2xs"
                                                px={1}
                                            >
                                                {plugins.length}
                                            </Badge>
                                        </HStack>
                                    </Tabs.Trigger>
                                )}
                                {permissions.length > 0 && (
                                    <Tabs.Trigger
                                        value="permissions"
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                    >
                                        <HStack gap={1}>
                                            <Text>Perms</Text>
                                            <Badge
                                                size="xs"
                                                fontSize="2xs"
                                                px={1}
                                            >
                                                {permissions.length}
                                            </Badge>
                                        </HStack>
                                    </Tabs.Trigger>
                                )}
                            </Tabs.List>

                            <Box flex="1" overflowY="auto" p={2}>
                                <Tabs.Content value="overview">
                                    <VStack align="stretch" gap={2}>
                                        {plugins.length > 0 && (
                                            <Box>
                                                <HStack gap={1} mb={1}>
                                                    <LuPlugZap size={14} />
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="medium"
                                                    >
                                                        Plugins
                                                    </Text>
                                                    <Badge
                                                        size="xs"
                                                        colorPalette="purple"
                                                    >
                                                        {plugins.length}
                                                    </Badge>
                                                </HStack>
                                                <VStack
                                                    align="stretch"
                                                    gap={0.5}
                                                >
                                                    {plugins.map((plugin) => (
                                                        <Box
                                                            key={plugin
                                                                .packageId}
                                                            px={2}
                                                            py={1}
                                                            rounded="sm"
                                                            bg="bg.subtle"
                                                            fontSize="2xs"
                                                        >
                                                            {plugin.packageName}
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        )}
                                        {pluginFunctionIds.length > 0 && (
                                            <Box>
                                                <HStack gap={1} mb={1}>
                                                    <LuPlugZap size={14} />
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="medium"
                                                    >
                                                        Functions
                                                    </Text>
                                                    <Badge
                                                        size="xs"
                                                        colorPalette="blue"
                                                    >
                                                        {pluginFunctionIds
                                                            .length}
                                                    </Badge>
                                                </HStack>
                                                <VStack
                                                    align="stretch"
                                                    gap={0.5}
                                                >
                                                    {pluginFunctionIds.map((
                                                        funcId,
                                                    ) => (
                                                        <Box
                                                            key={funcId}
                                                            px={2}
                                                            py={1}
                                                            rounded="sm"
                                                            bg="bg.subtle"
                                                            fontSize="2xs"
                                                        >
                                                            {funcId}
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        )}
                                        {permissions.length > 0 && (
                                            <Box>
                                                <HStack gap={1} mb={1}>
                                                    <LuShield size={14} />
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="medium"
                                                    >
                                                        Permissions
                                                    </Text>
                                                    <Badge
                                                        size="xs"
                                                        colorPalette="orange"
                                                    >
                                                        {permissions.length}
                                                    </Badge>
                                                </HStack>
                                                <Text
                                                    fontSize="2xs"
                                                    color="fg.muted"
                                                >
                                                    See Perms tab for details
                                                </Text>
                                            </Box>
                                        )}
                                    </VStack>
                                </Tabs.Content>

                                {plugins.length > 0 && (
                                    <Tabs.Content value="plugins">
                                        <VStack align="stretch" gap={1}>
                                            {plugins.map((plugin) => (
                                                <PluginInfo
                                                    key={plugin.packageId}
                                                    plugin={plugin}
                                                />
                                            ))}
                                        </VStack>
                                    </Tabs.Content>
                                )}

                                {permissions.length > 0 && (
                                    <Tabs.Content value="permissions">
                                        <VStack align="stretch" gap={1}>
                                            {permissions.map((
                                                allowedPerm,
                                                idx,
                                            ) => (
                                                <AllowedPermissionItem
                                                    key={idx}
                                                    allowedPermission={allowedPerm}
                                                />
                                            ))}
                                        </VStack>
                                    </Tabs.Content>
                                )}
                            </Box>
                        </Tabs.Root>
                    </Box>
                )}
            </Flex>
        </Flex>
    );
}
