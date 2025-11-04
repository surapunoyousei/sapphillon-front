import {
  Badge,
  Button,
  HStack,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  Separator,
  Spacer,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  LuClock,
  LuEraser,
  LuFileText,
  LuSparkles,
  LuSquare,
} from "react-icons/lu";
import React from "react";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { PromptHistoryDialog } from "./PromptHistoryDialog";
import { PromptTemplatesDialog } from "./PromptTemplatesDialog";

export function PromptPanel({
  prompt,
  onChange,
  onStart,
  onStop,
  streaming,
}: {
  prompt: string;
  onChange: (v: string) => void;
  onStart: () => void;
  onStop: () => void;
  streaming: boolean;
}) {
  const {
    history,
    starredHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleStar,
  } = usePromptHistory();

  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [templatesDialogOpen, setTemplatesDialogOpen] = React.useState(false);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        prompt.trim() &&
        !streaming
      ) {
        e.preventDefault();
        onStart();
      }
    },
    [onStart, prompt, streaming],
  );

  const handleStart = React.useCallback(() => {
    if (prompt.trim()) {
      addToHistory(prompt);
      onStart();
    }
  }, [prompt, addToHistory, onStart]);

  const handleSelectHistoryPrompt = React.useCallback(
    (selectedPrompt: string) => {
      onChange(selectedPrompt);
    },
    [onChange],
  );

  const handleSelectTemplate = React.useCallback(
    (templatePrompt: string) => {
      onChange(templatePrompt);
    },
    [onChange],
  );

  const characterCount = prompt.length;

  // 最近の履歴（最大3件）をクイックアクセス用に取得
  const recentHistory = React.useMemo(() => history.slice(0, 3), [history]);

  return (
    <>
      <VStack align="stretch" gap={2}>
        <HStack gap={2} flexWrap="wrap" minH="40px" alignItems="center">
          <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
            Prompt
          </Text>
          {characterCount > 0 && (
            <Badge colorPalette="gray" fontSize="xs">
              {characterCount} 文字
            </Badge>
          )}
          <Spacer minW={2} />

          {/* アクションボタン群 */}
          <HStack gap={2} flexWrap="wrap" alignItems="center">
            {/* テンプレートボタン */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setTemplatesDialogOpen(true)}
              minH={{ base: "36px", md: "auto" }}
              flexShrink={0}
            >
              <LuFileText size={14} />
              <Text fontSize={{ base: "xs", sm: "sm" }}>テンプレート</Text>
            </Button>

            {/* 履歴ボタン（メニュー付き） */}
            <MenuRoot positioning={{ placement: "bottom-end" }}>
              <MenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  minH={{ base: "36px", md: "auto" }}
                  flexShrink={0}
                >
                  <LuClock size={14} />
                  <Text fontSize={{ base: "xs", sm: "sm" }}>履歴</Text>
                  {history.length > 0 && (
                    <Badge ml={1} size="xs" colorPalette="blue">
                      {history.length}
                    </Badge>
                  )}
                </Button>
              </MenuTrigger>
              <MenuContent>
                {recentHistory.length > 0
                  ? (
                    <>
                      {recentHistory.map((item) => (
                        <MenuItem
                          key={item.id}
                          value={item.id}
                          onClick={() => handleSelectHistoryPrompt(item.prompt)}
                          fontSize="xs"
                          css={{
                            maxWidth: "300px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.prompt}
                        </MenuItem>
                      ))}
                      <Separator />
                    </>
                  )
                  : null}
                <MenuItem
                  value="view-all"
                  onClick={() => setHistoryDialogOpen(true)}
                  fontWeight="medium"
                  fontSize="xs"
                >
                  <LuClock size={14} />
                  すべての履歴を表示
                </MenuItem>
              </MenuContent>
            </MenuRoot>

            {/* クリアボタン */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange("")}
              disabled={streaming || !prompt}
              minH={{ base: "36px", md: "auto" }}
              flexShrink={0}
            >
              <LuEraser size={14} />
              <Text fontSize={{ base: "xs", sm: "sm" }}>Clear</Text>
            </Button>

            {/* 生成ボタン */}
            <Button
              size="sm"
              colorPalette="floorp"
              onClick={handleStart}
              disabled={!prompt.trim() || streaming}
              minH={{ base: "36px", md: "auto" }}
              flexShrink={0}
            >
              {streaming
                ? (
                  <HStack gap={1}>
                    <Spinner size="xs" />
                    <Text fontSize={{ base: "xs", sm: "sm" }}>Generating…</Text>
                  </HStack>
                )
                : (
                  <>
                    <LuSparkles size={14} />
                    <Text fontSize={{ base: "xs", sm: "sm" }}>Generate</Text>
                  </>
                )}
            </Button>

            {/* 停止ボタン */}
            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              onClick={onStop}
              disabled={!streaming}
              minH={{ base: "36px", md: "auto" }}
              flexShrink={0}
            >
              <LuSquare size={14} />
              <Text fontSize={{ base: "xs", sm: "sm" }}>Stop</Text>
            </Button>
          </HStack>
        </HStack>

        <Textarea
          rows={{ base: 3, md: 4 }}
          resize="vertical"
          placeholder="例: 最新のレポートをダウンロードして、チームにメールで送信する"
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          fontSize={{ base: "sm", md: "md" }}
        />

        <HStack justify="space-between" gap={2} flexWrap="wrap">
          <Text fontSize="xs" color="fg.muted">
            ⌘/Ctrl + Enter で実行
          </Text>
          <HStack gap={2} fontSize="xs" color="fg.muted">
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setTemplatesDialogOpen(true)}
            >
              テンプレートから選択
            </Button>
            {history.length > 0 && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setHistoryDialogOpen(true)}
              >
                履歴から選択
              </Button>
            )}
          </HStack>
        </HStack>
      </VStack>

      {/* 履歴ダイアログ */}
      <PromptHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        history={history}
        starredHistory={starredHistory}
        onSelectPrompt={handleSelectHistoryPrompt}
        onRemove={removeFromHistory}
        onToggleStar={toggleStar}
        onClear={clearHistory}
      />

      {/* テンプレートダイアログ */}
      <PromptTemplatesDialog
        open={templatesDialogOpen}
        onClose={() => setTemplatesDialogOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
}
