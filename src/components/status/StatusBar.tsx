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
      px={{ base: 2, md: 4 }}
      py={{ base: 1, md: 2 }}
      borderTopWidth="1px"
      borderTopColor="border"
      bg="bg.panel"
      color="fg.muted"
      fontSize={{ base: "xs", md: "sm" }}
      align="center"
      gap={{ base: 2, md: 3 }}
      flexWrap="wrap"
      css={{
        "@media (max-height: 600px) and (orientation: landscape)": {
          paddingTop: "0.25rem",
          paddingBottom: "0.25rem",
        },
      }}
    >
      <HStack gap={2} flexShrink={0}>
        <Text whiteSpace="nowrap">Automotor Status</Text>
        <Badge
          colorPalette={grpc === "connected"
            ? "green"
            : grpc === "connecting"
            ? "yellow"
            : "red"}
          fontSize={{ base: "xs", md: "sm" }}
        >
          {grpc}
        </Badge>
      </HStack>

      <Box
        w="1px"
        h="4"
        bg="border"
        mx={1}
        display={{ base: "none", sm: "block" }}
      />

      {/* Placeholders like LLM/Queue can be restored when wired */}

      <Spacer />
      {version
        ? (
          <HStack gap={2} flexShrink={0}>
            <Text display={{ base: "none", sm: "block" }} whiteSpace="nowrap">
              Version:
            </Text>
            <Badge colorPalette="gray" fontSize={{ base: "xs", md: "sm" }}>
              {version}
            </Badge>
          </HStack>
        )
        : null}
    </HStack>
  );
}
