import React from "react";
import {
    Box,
    Button,
    Card,
    Flex,
    Heading,
    HStack,
    Spinner,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuPlugZap, LuShield } from "react-icons/lu";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { useWorkflow } from "./useWorkflow";
import type { PluginPackage, Permission } from "@/gen/sapphillon/v1/plugin_pb";
import type { AllowedPermission } from "@/gen/sapphillon/v1/permission_pb";
import { PermissionType, PermissionLevel } from "@/gen/sapphillon/v1/permission_pb";

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
        <Card.Root size="sm">
            <Card.Body p={2}>
                <VStack align="stretch" gap={1}>
                    <Text fontSize="sm" fontWeight="medium">
                        {getPermissionTypeLabel(permission.permissionType)}
                    </Text>
                    {permission.resource && permission.resource.length > 0 && (
                        <Text fontSize="xs" color="fg.muted">
                            Resources: {permission.resource.join(", ")}
                        </Text>
                    )}
                    <Box
                        px={2}
                        py={0.5}
                        rounded="sm"
                        bg={`${getPermissionLevelColor(permission.permissionLevel)}.100`}
                        color={`${getPermissionLevelColor(permission.permissionLevel)}.700`}
                        fontSize="xs"
                        fontWeight="medium"
                        w="fit-content"
                    >
                        {permission.permissionLevel === PermissionLevel.MEDIUM
                            ? "Medium"
                            : permission.permissionLevel === PermissionLevel.HIGH
                              ? "High"
                              : permission.permissionLevel === PermissionLevel.CRITICAL
                                ? "Critical"
                                : "Unspecified"}
                    </Box>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
}

function AllowedPermissionItem({ allowedPermission }: { allowedPermission: AllowedPermission }) {
    return (
        <Card.Root size="sm">
            <Card.Body p={2}>
                <VStack align="stretch" gap={2}>
                    <Text fontSize="sm" fontWeight="semibold">
                        {allowedPermission.pluginFunctionId}
                    </Text>
                    {allowedPermission.permissions && allowedPermission.permissions.length > 0 && (
                        <VStack align="stretch" gap={1}>
                            {allowedPermission.permissions.map((permission, idx) => (
                                <PermissionItem key={idx} permission={permission} />
                            ))}
                        </VStack>
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    );
}

function PluginInfo({ plugin }: { plugin: PluginPackage }) {
    return (
        <Card.Root size="sm">
            <Card.Body p={3}>
                <VStack align="stretch" gap={2}>
                    <HStack justify="space-between" align="start">
                        <VStack align="start" gap={0.5} flex="1">
                            <Text fontSize="sm" fontWeight="semibold">
                                {plugin.packageName}
                            </Text>
                            <Text fontSize="xs" color="fg.muted">
                                v{plugin.packageVersion}
                            </Text>
                        </VStack>
                    </HStack>
                    {plugin.description && (
                        <Text fontSize="xs" color="fg.muted">
                            {plugin.description}
                        </Text>
                    )}
                    {plugin.functions && plugin.functions.length > 0 && (
                        <VStack align="stretch" gap={1}>
                            <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                                Functions:
                            </Text>
                            {plugin.functions.map((func) => (
                                <Box
                                    key={func.functionId}
                                    px={2}
                                    py={1}
                                    rounded="sm"
                                    bg="bg.subtle"
                                    fontSize="xs"
                                >
                                    {func.functionName || func.functionId}
                                </Box>
                            ))}
                        </VStack>
                    )}
                </VStack>
            </Card.Body>
        </Card.Root>
    );
}

export function WorkflowViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { workflow, loading, error } = useWorkflow(id || "");

    const latestCode = React.useMemo(() => {
        if (!workflow?.workflowCode || workflow.workflowCode.length === 0) return null;
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
                                {error instanceof Error ? error.message : String(error)}
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
                </HStack>
            </Box>

            {/* Main Content */}
            <Flex flex="1" overflow="hidden" position="relative">
                {/* Canvas Area */}
                <Box flex="1" overflow="hidden" position="relative">
                    <WorkflowCanvas workflow={workflow} withBackground={true} />
                </Box>

                {/* Floating Info Panel */}
                <Box
                    position="absolute"
                    right={{ base: 0, md: 4 }}
                    top={{ base: 0, md: 4 }}
                    bottom={{ base: 0, md: 4 }}
                    left={{ base: 0, md: "auto" }}
                    w={{ base: "full", md: "320px" }}
                    maxW={{ base: "full", md: "320px" }}
                    zIndex={20}
                    pointerEvents="none"
                    display={{ base: "none", lg: "block" }}
                >
                    <Box
                        h="full"
                        pointerEvents="auto"
                        bg="bg.panel"
                        borderWidth="1px"
                        borderColor="border"
                        rounded="lg"
                        shadow="xl"
                        p={4}
                        overflowY="auto"
                    >
                        <VStack align="stretch" gap={4}>
                            {/* Plugins */}
                            {plugins.length > 0 && (
                                <VStack align="stretch" gap={2}>
                                    <HStack gap={2} align="center">
                                        <LuPlugZap size={18} />
                                        <Heading size="sm">Plugins</Heading>
                                    </HStack>
                                    <VStack align="stretch" gap={2}>
                                        {plugins.map((plugin) => (
                                            <PluginInfo
                                                key={plugin.packageId}
                                                plugin={plugin}
                                            />
                                        ))}
                                    </VStack>
                                </VStack>
                            )}

                            {/* Plugin Functions */}
                            {pluginFunctionIds.length > 0 && (
                                <VStack align="stretch" gap={2}>
                                    <HStack gap={2} align="center">
                                        <LuPlugZap size={18} />
                                        <Heading size="sm">Used Functions</Heading>
                                    </HStack>
                                    <VStack align="stretch" gap={1}>
                                        {pluginFunctionIds.map((funcId) => (
                                            <Box
                                                key={funcId}
                                                px={2}
                                                py={1}
                                                rounded="sm"
                                                bg="bg.subtle"
                                                fontSize="xs"
                                            >
                                                {funcId}
                                            </Box>
                                        ))}
                                    </VStack>
                                </VStack>
                            )}

                            {/* Permissions */}
                            {permissions.length > 0 && (
                                <VStack align="stretch" gap={2}>
                                    <HStack gap={2} align="center">
                                        <LuShield size={18} />
                                        <Heading size="sm">Permissions</Heading>
                                    </HStack>
                                    <VStack align="stretch" gap={2}>
                                        {permissions.map((allowedPerm, idx) => (
                                            <AllowedPermissionItem
                                                key={idx}
                                                allowedPermission={allowedPerm}
                                            />
                                        ))}
                                    </VStack>
                                </VStack>
                            )}

                            {/* Empty State */}
                            {plugins.length === 0 &&
                                pluginFunctionIds.length === 0 &&
                                permissions.length === 0 && (
                                    <Text fontSize="sm" color="fg.muted" textAlign="center">
                                        No plugins or permissions information available
                                    </Text>
                                )}
                        </VStack>
                    </Box>
                </Box>
            </Flex>
        </Flex>
    );
}

