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
export function HomePage() {
  const navigate = useNavigate();
  const { status, version, lastUpdated } = useVersionPing(10000);

  return (
    <Box
      as="section"
      minH={{ base: "calc(100dvh - 100px)", md: "calc(100dvh - 140px)" }}
      display="flex"
      alignItems="center"
      css={{
        '@media (max-height: 600px) and (orientation: landscape)': {
          minHeight: 'auto',
          paddingTop: '1rem',
          paddingBottom: '1rem',
        }
      }}
    >
      <VStack w="full" maxW="3xl" mx="auto" px={{ base: 3, sm: 4, md: 6 }} py={{ base: 6, sm: 8, md: 10 }} gap={{ base: 6, sm: 7, md: 8 }}>
        {/* ChatGPT-like hero */}
        <VStack gap={{ base: 2, sm: 2.5, md: 3 }} textAlign="center">
          <Heading size={{ base: "xl", sm: "2xl", md: "3xl" }} lineHeight="1.2">
            あなたが今やりたいことを代わりに実行する統合プラットフォーム
          </Heading>
          <Text color="fg.muted" fontSize={{ base: "sm", sm: "md", md: "lg" }} px={{ base: 2, md: 0 }}>
            Floorp OS が、命令をあなたのように安全に実行し、結果を報告します。
          </Text>
        </VStack>

        <Box w="full" borderWidth="1px" rounded="lg" p={{ base: 2, md: 3 }} bg="bg">
          <Textarea
            placeholder="e.g. Download the latest report and email it to my team"
            rows={{ base: 3, md: 4 }}
            fontSize={{ base: "sm", md: "md" }}
          />
          <HStack justify="space-between" mt={2} color="fg.muted" flexWrap="wrap" gap={2}>
            <HStack gap={2} flexWrap="wrap" flex={1} minW={0}>
              <Hint>Summarize this tab</Hint>
              <Hint display={{ base: "none", sm: "block" }}>Rename files in Downloads</Hint>
              <Hint display={{ base: "none", md: "block" }}>Notify me when it rains</Hint>
            </HStack>
            <HStack display={{ base: "none", sm: "flex" }}>
              <Kbd fontSize={{ base: "xs", md: "sm" }}>⌘</Kbd>
              <Kbd fontSize={{ base: "xs", md: "sm" }}>Enter</Kbd>
            </HStack>
          </HStack>
        </Box>

        {/* Quick actions */}
        <HStack gap={{ base: 2, md: 3 }} justify="center" flexWrap="wrap">
          <Button 
            onClick={() => navigate("/generate")} 
            variant="surface"
            size={{ base: "sm", md: "md" }}
          >
            <Text fontSize={{ base: "sm", md: "md" }}>Generate</Text>
          </Button>
          <Button 
            onClick={() => navigate("/run")} 
            variant="surface"
            size={{ base: "sm", md: "md" }}
          >
            <Text fontSize={{ base: "sm", md: "md" }}>Run</Text>
          </Button>
          <Button 
            onClick={() => navigate("/plugins")} 
            colorPalette="floorp"
            size={{ base: "sm", md: "md" }}
          >
            <Text fontSize={{ base: "sm", md: "md" }}>Plugins</Text>
          </Button>
        </HStack>

        {/* Status strip below hero */}
        <Box w="full" borderWidth="1px" rounded="md" p={{ base: 2, md: 3 }}>
          <HStack gap={{ base: 3, md: 6 }} wrap="wrap" justify={{ base: "center", sm: "flex-start" }}>
            <HStack gap={2}>
              <Text color="fg.muted" fontSize={{ base: "xs", md: "sm" }}>Automotor Status</Text>
              <Badge
                colorPalette={status === "connected"
                  ? "green"
                  : status === "connecting"
                  ? "yellow"
                  : "red"}
                fontSize={{ base: "xs", md: "sm" }}
              >
                {status}
              </Badge>
            </HStack>
            <HStack gap={2}>
              <Text color="fg.muted" fontSize={{ base: "xs", md: "sm" }}>Version</Text>
              <Badge colorPalette="gray" fontSize={{ base: "xs", md: "sm" }}>{version || "-"}</Badge>
            </HStack>
            <HStack gap={2} display={{ base: "none", sm: "flex" }}>
              <Text color="fg.muted" fontSize={{ base: "xs", md: "sm" }}>Updated</Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color="fg.muted">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "-"}
              </Text>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}

function Hint({ children, display }: { children: React.ReactNode; display?: any }) {
  return (
    <Box 
      px={{ base: 2, md: 3 }} 
      py={{ base: 1, md: 1.5 }} 
      borderWidth="1px" 
      rounded="md" 
      bg="bg.subtle"
      display={display}
    >
      <Text fontSize={{ base: "xs", md: "sm" }}>{children}</Text>
    </Box>
  );
}
