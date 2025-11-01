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
          <Input 
            size="sm"
            placeholder="Search plugins…" 
            maxW={{ base: "32", sm: "40" }}
            fontSize={{ base: "xs", sm: "sm" }}
            minH={{ base: "36px", md: "auto" }}
          />
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
