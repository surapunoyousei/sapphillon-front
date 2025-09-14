import {
  Badge,
  HStack,
  Input,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";

export function PluginsPanel() {
  return (
    <VStack
      align="stretch"
      gap={2}
      p={3}
      borderWidth="1px"
      bg="bg"
      rounded="md"
      h="full"
      minH={0}
      display="grid"
      gridTemplateRows="auto 1px minmax(0, 1fr)"
      overflow="hidden"
    >
      <HStack justify="space-between" align="center">
        <Text fontWeight="medium">Plugins</Text>
        <HStack gap={2}>
          <Input size="sm" placeholder="Search plugins…" maxW="40" />
        </HStack>
      </HStack>
      <Separator />
      <VStack align="stretch" gap={2} minH={0} overflowY="auto">
        {pluginItem("Floorp ", "0.0.1", true)}
        {pluginItem("Fetch", "0.0.1", true)}
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
      p={2}
    >
      <VStack align="start" gap={0}>
        <Text fontWeight="medium">{name}</Text>
        <Text fontSize="xs" color="fg.muted">v{version}</Text>
      </VStack>
      <HStack gap={3}>
        <Badge colorPalette={enabled ? "green" : "gray"}>
          {enabled ? "enabled" : "disabled"}
        </Badge>
      </HStack>
    </HStack>
  );
}
