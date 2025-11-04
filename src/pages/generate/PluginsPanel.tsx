import {
  Badge,
  HStack,
  Input,
  InputGroup,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { EmptyState } from "@/components/ui/empty-state";
import { LuPackage } from "react-icons/lu";

export function PluginsPanel() {
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
        <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Plugins</Text>
        <HStack gap={2}>
          <InputGroup size="sm" maxW={{ base: "32", sm: "40" }}>
          <Input 
            placeholder="Search plugins…" 
            fontSize={{ base: "xs", sm: "sm" }}
            minH={{ base: "36px", md: "auto" }}
          />
          </InputGroup>
        </HStack>
      </HStack>
      <Separator />
      <VStack align="stretch" gap={2} minH={0} overflowY="auto">
        {plugins.length === 0 ? (
          <EmptyState
            icon={<LuPackage />}
            title="プラグインがありません"
            description="プラグインをインストールして、ワークフローで使用できるようにしましょう。"
          />
        ) : (
          plugins.map((plugin) => pluginItem(plugin.name, plugin.version, plugin.enabled))
        )}
      </VStack>
    </VStack>
  );
}

function pluginItem(name: string, version: string, enabled: boolean) {
  return (
    <HStack
      key={name}
      justify="space-between"
      borderWidth="1px"
      rounded="md"
      p={{ base: 1.5, md: 2 }}
    >
      <VStack align="start" gap={0}>
        <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>{name}</Text>
        <Text fontSize="xs" color="fg.muted">v{version}</Text>
      </VStack>
      <HStack gap={3}>
        <Badge 
          colorPalette={enabled ? "green" : "gray"}
          fontSize="xs"
          px={{ base: 1, md: 2 }}
        >
          {enabled ? "enabled" : "disabled"}
        </Badge>
      </HStack>
    </HStack>
  );
}
