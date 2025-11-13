import React from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  HStack,
  IconButton,
  Separator,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  LuCheck,
  LuPackage,
  LuPlay,
  LuSend,
  LuShield,
  LuSparkles,
  LuX,
} from "react-icons/lu";
import { useI18n } from "@/hooks/useI18n";
import { useWorkflowGeneration } from "@/pages/generate/useWorkflowGeneration";
import type { AllowedPermission, Permission } from "@/gen/sapphillon/v1/permission_pb";
import { PermissionType, PermissionLevel } from "@/gen/sapphillon/v1/permission_pb";
import { StreamConsole } from "@/components/console";


function getPermissionTypeLabel(type: PermissionType, t: (key: string) => string): string {
  switch (type) {
    case PermissionType.EXECUTE:
      return t("permissions.execute");
    case PermissionType.FILESYSTEM_READ:
      return t("permissions.filesystemRead");
    case PermissionType.FILESYSTEM_WRITE:
      return t("permissions.filesystemWrite");
    case PermissionType.NET_ACCESS:
      return t("permissions.netAccess");
    case PermissionType.ALLOW_MCP:
      return t("permissions.allowMcp");
    case PermissionType.ALLOW_ALL:
      return t("permissions.allowAll");
    default:
      return t("permissions.unknown");
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
  const { t } = useI18n();
  return (
    <Box
      px={3}
      py={2}
      rounded="md"
      bg="bg.subtle"
      borderLeftWidth="3px"
      borderLeftColor={`${getPermissionLevelColor(permission.permissionLevel)}.500`}
    >
      <HStack justify="space-between" gap={2} mb={1}>
        <Text fontSize="sm" fontWeight="medium" flex="1">
          {getPermissionTypeLabel(permission.permissionType, t)}
        </Text>
        <Badge
          size="sm"
          colorPalette={getPermissionLevelColor(permission.permissionLevel)}
        >
          {permission.permissionLevel === PermissionLevel.MEDIUM
            ? t("permissions.medium")
            : permission.permissionLevel === PermissionLevel.HIGH
            ? t("permissions.high")
            : permission.permissionLevel === PermissionLevel.CRITICAL
            ? t("permissions.critical")
            : t("permissions.low")}
        </Badge>
      </HStack>
      {permission.description && (
        <Text fontSize="xs" color="fg.muted" mt={1}>
          {permission.description}
        </Text>
      )}
      {permission.resource && permission.resource.length > 0 && (
        <Text fontSize="xs" color="fg.muted" mt={1}>
          {t("permissions.resources")}: {permission.resource.join(", ")}
        </Text>
      )}
    </Box>
  );
}

function AllowedPermissionItem({ allowedPermission }: { allowedPermission: AllowedPermission }) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { t } = useI18n();

  return (
    <Box>
      <HStack
        px={3}
        py={2}
        bg="bg.subtle"
        rounded="md"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{ bg: "bg.muted" }}
        justify="space-between"
        gap={2}
        mb={1}
      >
        <Text fontSize="sm" fontWeight="medium" flex="1" truncate>
          {allowedPermission.pluginFunctionId}
        </Text>
        <HStack gap={2}>
          {allowedPermission.permissions && allowedPermission.permissions.length > 0 && (
            <Badge size="sm" colorPalette="blue">
              {allowedPermission.permissions.length}
            </Badge>
          )}
          {isExpanded ? <LuX size={14} /> : <LuCheck size={14} />}
        </HStack>
      </HStack>
      {isExpanded && allowedPermission.permissions && allowedPermission.permissions.length > 0 && (
        <VStack align="stretch" gap={2} mt={2} ml={2}>
          {allowedPermission.permissions.map((permission, idx) => (
            <PermissionItem key={idx} permission={permission} />
          ))}
        </VStack>
      )}
    </Box>
  );
}

export function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [prompt, setPrompt] = React.useState("");
  const [showPermissionDialog, setShowPermissionDialog] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const { streaming, events, latest, runRes, start, stop, runLatest, clearEvents } = useWorkflowGeneration();

  // 最新のワークフロー定義から権限を抽出
  const permissions = React.useMemo(() => {
    if (!latest?.workflowDefinition?.workflowCode) return [];
    const latestCode = latest.workflowDefinition.workflowCode[latest.workflowDefinition.workflowCode.length - 1];
    return latestCode?.allowedPermissions || [];
  }, [latest]);

  const handleGenerate = React.useCallback(async () => {
    if (!prompt.trim() || streaming) return;
    clearEvents();
    await start(prompt.trim());
  }, [prompt, streaming, start, clearEvents]);

  const handleConfirmAndRun = React.useCallback(async () => {
    setShowPermissionDialog(false);
    await runLatest();
  }, [runLatest]);

  const handleRunDirectly = React.useCallback(async () => {
    // 権限がない場合は直接実行
    if (permissions.length === 0) {
      await runLatest();
    } else {
      // 権限がある場合は確認ダイアログを表示
      setShowPermissionDialog(true);
    }
  }, [permissions.length, runLatest]);

  // 生成が完了したら権限確認ダイアログを表示（権限がある場合のみ）
  React.useEffect(() => {
    if (latest?.workflowDefinition && permissions.length > 0 && !streaming && !runRes && !showPermissionDialog) {
      // 少し遅延させて、生成完了のアニメーションを見せる
      const timer = setTimeout(() => {
        setShowPermissionDialog(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [latest, permissions.length, streaming, runRes, showPermissionDialog]);

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
            <Box
              fontSize={{ base: "4xl", sm: "5xl", md: "6xl" }}
              mb={2}
              color="fg.muted"
            >
              <LuSparkles />
            </Box>
            <Heading
              size={{ base: "xl", sm: "2xl", md: "3xl" }}
              lineHeight="1.2"
            >
              {t("home.title")}
            </Heading>
            <Text
              color="fg.muted"
              fontSize={{ base: "sm", sm: "md", md: "lg" }}
              px={{ base: 2, md: 0 }}
            >
              {t("home.subtitle")}
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
              onClick={() => navigate("/plugins")}
              variant="surface"
              size={{ base: "sm", md: "md" }}
            >
              <LuPackage />
              <Text fontSize={{ base: "sm", md: "md" }}>
                {t("common.plugins")}
              </Text>
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Fixed bottom input bar - ChatGPT mobile style */}
      <Box
        w="full"
        flexShrink={0}
        borderTopWidth="1px"
        borderTopColor="border"
        bg="bg.panel"
        px={{ base: 3, sm: 4, md: 6, lg: 8, xl: 12 }}
        py={{ base: 3, md: 4, lg: 6 }}
        css={{
          "@media (max-height: 600px) and (orientation: landscape)": {
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          },
        }}
      >
        <Box
          maxW={{ base: "full", lg: "full", xl: "7xl", "2xl": "8xl" }}
          mx="auto"
          borderWidth="1px"
          rounded="xl"
          p={{ base: 2, md: 3, lg: 4 }}
          bg="bg"
          shadow="sm"
        >
          <HStack gap={2} align="flex-end">
            <Textarea
              ref={textareaRef}
              placeholder={t("home.placeholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              rows={2}
              minH="120px"
              fontSize="md"
              resize="none"
              disabled={streaming}
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
              aria-label={streaming ? t("common.stop") : t("common.send")}
              onClick={streaming ? stop : handleGenerate}
              disabled={!prompt.trim() && !streaming}
              colorPalette="floorp"
              size={{ base: "md", md: "lg" }}
              flexShrink={0}
              minH={{ base: "36px", md: "44px" }}
              minW={{ base: "36px", md: "44px" }}
            >
              {streaming ? <LuX /> : <LuSend />}
            </IconButton>
          </HStack>
          {(streaming || events.length > 0 || runRes) && (
            <Box mt={3} borderWidth="1px" rounded="md" p={3} bg="bg.subtle" maxH="200px" overflowY="auto">
              <StreamConsole events={events} streaming={streaming} />
            </Box>
          )}
          {latest?.workflowDefinition && !streaming && !runRes && (
            <HStack mt={3} justify="flex-end" gap={2}>
              <Button
                onClick={handleRunDirectly}
                colorPalette="floorp"
                size={{ base: "sm", md: "md" }}
              >
                <LuPlay />
                <Text>{t("common.execute")}</Text>
              </Button>
            </HStack>
          )}
        </Box>
      </Box>

      {/* 権限確認ダイアログ */}
      <Dialog.Root
        open={showPermissionDialog}
        onOpenChange={(e) => setShowPermissionDialog(e.open)}
        size={{ base: "full", md: "xl" }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={{ base: "100vw", md: "90vw" }} maxH={{ base: "100vh", md: "90vh" }}>
            <Dialog.Header>
              <HStack gap={2}>
                <LuShield />
                <Text fontWeight="medium" fontSize={{ base: "md", md: "lg" }}>
                  {t("permissions.reviewRequired")}
                </Text>
              </HStack>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body minH={{ base: "60vh", md: "70vh" }} overflowY="auto">
              <VStack align="stretch" gap={4}>
                <Text fontSize="sm" color="fg.muted">
                  {t("permissions.reviewDescription")}
                </Text>
                <Separator />
                <VStack align="stretch" gap={3}>
                  {permissions.map((allowedPerm, idx) => (
                    <AllowedPermissionItem key={idx} allowedPermission={allowedPerm} />
                  ))}
                </VStack>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={2} w="full" justify="flex-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPermissionDialog(false)}
                  size={{ base: "sm", md: "md" }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleConfirmAndRun}
                  colorPalette="floorp"
                  size={{ base: "sm", md: "md" }}
                >
                  <LuPlay />
                  <Text>{t("permissions.confirmAndRun")}</Text>
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  );
}
