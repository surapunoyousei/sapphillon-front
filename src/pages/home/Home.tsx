import React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Kbd,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LuSend } from "react-icons/lu";

export function HomePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = React.useCallback(() => {
    if (prompt.trim()) {
      navigate("/generate");
    }
  }, [prompt, navigate]);

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
            <Heading
              size={{ base: "xl", sm: "2xl", md: "3xl" }}
              lineHeight="1.2"
            >
              あなたが今やりたいことを代わりに実行する統合プラットフォーム
            </Heading>
            <Text
              color="fg.muted"
              fontSize={{ base: "sm", sm: "md", md: "lg" }}
              px={{ base: 2, md: 0 }}
            >
              Floorp OS が、命令をあなたのように安全に実行し、結果を報告します。
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
        </VStack>
      </Box>

      {/* Fixed bottom input bar - ChatGPT mobile style */}
      <Box
        w="full"
        borderTopWidth="1px"
        borderTopColor="border"
        bg="bg.panel"
        px={{ base: 3, sm: 4, md: 6 }}
        py={{ base: 3, md: 4 }}
        css={{
          "@media (max-height: 600px) and (orientation: landscape)": {
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          },
        }}
      >
        <Box
          maxW="3xl"
          mx="auto"
          borderWidth="1px"
          rounded="xl"
          p={{ base: 2, md: 3 }}
          bg="bg"
          shadow="sm"
        >
          <HStack gap={2} align="flex-end">
            <Textarea
              ref={textareaRef}
              placeholder="e.g. Download the latest report and email it to my team"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                // Cmd/Ctrl+Enter で送信（デスクトップ）
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                } // Enter キーで送信（モバイル、またはデスクトップで Shift なしの場合）
                // Shift+Enter は改行を許可
                else if (e.key === "Enter" && !e.shiftKey) {
                  // モバイルデバイスでは Enter で送信
                  // デスクトップでは Cmd+Enter を使うことを推奨
                  const isMobile = window.innerWidth < 768;
                  if (isMobile) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }
              }}
              rows={2}
              minH="120px"
              fontSize="md"
              resize="none"
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
              aria-label="Send"
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              colorPalette="floorp"
              size={{ base: "md", md: "lg" }}
              flexShrink={0}
              minH={{ base: "36px", md: "44px" }}
              minW={{ base: "36px", md: "44px" }}
            >
              <LuSend />
            </IconButton>
          </HStack>
          <HStack
            justify="space-between"
            mt={2}
            color="fg.muted"
            display={{ base: "none", sm: "flex" }}
          >
            <Text fontSize={{ base: "xs", md: "sm" }}>
              Press <Kbd fontSize={{ base: "xs", md: "sm" }}>⌘</Kbd> +{" "}
              <Kbd fontSize={{ base: "xs", md: "sm" }}>Enter</Kbd> to send
            </Text>
          </HStack>
        </Box>
      </Box>
    </Flex>
  );
}
