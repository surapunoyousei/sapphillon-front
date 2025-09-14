import React from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Kbd,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useVersionPing } from "@/hooks";
import { LuPlay, LuPlugZap, LuSparkles } from "react-icons/lu";
export function HomePage() {
  const navigate = useNavigate();
  const { status, version, lastUpdated } = useVersionPing(10000);

  return (
    <Box
      as="section"
      minH="calc(100dvh - 140px)"
      display="flex"
      alignItems="center"
    >
      <VStack w="full" maxW="3xl" mx="auto" px={4} py={10} gap={8}>
        {/* ChatGPT-like hero */}
        <VStack gap={3} textAlign="center">
          <Heading size="2xl">
            あなたが今やりたいことを代わりに実行・発見するエージェント
          </Heading>
          <Text color="fg.muted">
            Floorp OS が、命令をあなたのように安全に実行し、結果を報告します。
          </Text>
        </VStack>

        <Box w="full" borderWidth="1px" rounded="lg" p={3} bg="bg">
          <Textarea
            placeholder="e.g. Download the latest report and email it to my team"
            rows={4}
          />
          <HStack justify="space-between" mt={2} color="fg.muted">
            <HStack gap={2}>
              <Hint>Summarize this tab</Hint>
              <Hint>Rename files in Downloads</Hint>
              <Hint>Notify me when it rains</Hint>
            </HStack>
            <HStack>
              <Kbd>⌘</Kbd>
              <Kbd>Enter</Kbd>
            </HStack>
          </HStack>
        </Box>

        {/* Quick actions */}
        <HStack gap={3} justify="center">
          <Button onClick={() => navigate("/generate")} colorPalette="blue">
            <HStack>
              <Box as={LuSparkles} css={{ width: 18, height: 18 }} />
              <Text>Generate</Text>
            </HStack>
          </Button>
          <Button onClick={() => navigate("/run")} colorPalette="green">
            <HStack>
              <Box as={LuPlay} css={{ width: 18, height: 18 }} />
              <Text>Run</Text>
            </HStack>
          </Button>
          <Button onClick={() => navigate("/plugins")} colorPalette="purple">
            <HStack>
              <Box as={LuPlugZap} css={{ width: 18, height: 18 }} />
              <Text>Plugins</Text>
            </HStack>
          </Button>
        </HStack>

        {/* Status strip below hero */}
        <Box w="full" borderWidth="1px" rounded="md" p={3}>
          <HStack gap={6} wrap="wrap">
            <HStack gap={2}>
              <Text color="fg.muted">Automotor Status</Text>
              <Badge
                colorPalette={status === "connected"
                  ? "green"
                  : status === "connecting"
                  ? "yellow"
                  : "red"}
              >
                {status}
              </Badge>
            </HStack>
            <HStack gap={2}>
              <Text color="fg.muted">Version</Text>
              <Badge colorPalette="gray">{version || "-"}</Badge>
            </HStack>
            <HStack gap={2}>
              <Text color="fg.muted">Updated</Text>
              <Text fontSize="sm" color="fg.muted">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "-"}
              </Text>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <Box px={3} py={1.5} borderWidth="1px" rounded="md" bg="bg.subtle">
      <Text fontSize="sm">{children}</Text>
    </Box>
  );
}
