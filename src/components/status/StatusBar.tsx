import React from "react";
import { Badge, Box, HStack, Spacer, Text } from "@chakra-ui/react";
import { useVersionPing } from "@/hooks";

export function StatusBar() {
  const [grpc, setGrpc] = React.useState<
    "connected" | "connecting" | "disconnected"
  >("connecting");
  const { status, version } = useVersionPing(10000);

  React.useEffect(() => {
    setGrpc(status);
  }, [status]);

  return (
    <HStack
      as="footer"
      px={4}
      py={2}
      borderTopWidth="1px"
      color="fg.muted"
      fontSize="sm"
      align="center"
      gap={3}
    >
      <Text>Core System Status:</Text>
      <Badge
        colorPalette={grpc === "connected"
          ? "green"
          : grpc === "connecting"
          ? "yellow"
          : "red"}
      >
        {grpc}
      </Badge>

      <Box w="1px" h="4" bg="border" mx={1} />

      {/* Placeholders like LLM/Queue can be restored when wired */}

      <Spacer />
      {version
        ? (
          <HStack>
            <Text>Version:</Text>
            <Badge colorPalette="gray">{version}</Badge>
          </HStack>
        )
        : null}
    </HStack>
  );
}
