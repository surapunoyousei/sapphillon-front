import {
  Badge,
  HStack,
  Input,
  InputGroup,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { EmptyState } from "@/components/ui/empty-state";
import { LuPackage } from "react-icons/lu";
import { useI18n } from "@/hooks/useI18n";

export function PluginsPanel() {
  const { t } = useI18n();
  const plugins = [
    { name: "Floorp ", version: "0.0.1", enabled: true },
    { name: "Fetch", version: "0.0.1", enabled: true },
  ];

  return (
    <VStack
      align="stretch"
      gap={2}
      p={{ base: 2, md: 3 }}
      borderWidth="1px"
      bg="bg"
      rounded="md"
      h="full"
      minH={0}
      display="grid"
      gridTemplateRows="auto 1px minmax(0, 1fr)"
      overflow="hidden"
    >
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
        <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
          {t("common.plugins")}
        </Text>
        <HStack gap={2}>
          <InputGroup maxW={{ base: "32", sm: "40" }}>
            <Input
              placeholder={t("plugins.searchPlaceholder")}
              fontSize={{ base: "xs", sm: "sm" }}
              minH={{ base: "36px", md: "auto" }}
            />
          </InputGroup>
        </HStack>
      </HStack>
      <Separator />
      <VStack align="stretch" gap={2} minH={0} overflowY="auto">
        {plugins.length === 0
          ? (
            <EmptyState
              icon={<LuPackage />}
              title={t("plugins.emptyTitle")}
              description={t("plugins.emptyDescription")}
            />
          )
          : (
            plugins.map((plugin) =>
              pluginItem(plugin.name, plugin.version, plugin.enabled, t)
            )
          )}
      </VStack>
    </VStack>
  );
}

function pluginItem(name: string, version: string, enabled: boolean, t: (key: string) => string) {
  return (
    <HStack
      key={name}
      justify="space-between"
      borderWidth="1px"
      rounded="md"
      p={{ base: 1.5, md: 2 }}
    >
      <VStack align="start" gap={0}>
        <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
          {name}
        </Text>
        <Text fontSize="xs" color="fg.muted">v{version}</Text>
      </VStack>
      <HStack gap={3}>
        <Badge
          colorPalette={enabled ? "green" : "gray"}
          fontSize="xs"
          px={{ base: 1, md: 2 }}
        >
          {enabled ? t("plugins.enabled") : t("plugins.disabled")}
        </Badge>
      </HStack>
    </HStack>
  );
}
