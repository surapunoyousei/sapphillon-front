import React from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  HStack,
  Input,
  Kbd,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";

interface OmniBarItem {
  label: string;
  hint?: string;
  to?: string;
  kind: "navigate" | "action";
  icon?: React.ReactNode;
}

export interface OmniBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const getDefaultItems = (t: (key: string) => string): OmniBarItem[] => [
  { label: t("omniBar.goToFix"), hint: "/fix", to: "/fix", kind: "navigate" },
  { label: t("omniBar.runWorkflow"), hint: "/run", to: "/run", kind: "navigate" },
  { label: t("omniBar.openPlugins"), hint: "/plugins", to: "/plugins", kind: "navigate" },
];

export function OmniBar({ isOpen, onClose }: OmniBarProps) {
  const { t } = useI18n();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const navigate = useNavigate();

  const items = React.useMemo(() => {
    const defaultItems = getDefaultItems(t);
    const q = query.trim().toLowerCase();
    
    // クエリがない場合はデフォルト項目のみ
    if (!q) return defaultItems;
    
    // デフォルト項目のフィルタリング
    const filteredDefaults = defaultItems.filter((i) =>
      i.label.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q)
    );
    
    return filteredDefaults;
  }, [query, t]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, Math.max(0, items.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const it = items[active];
        if (it?.to) {
          navigate(it.to);
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, items, active, navigate, onClose]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: "full", md: "2xl" }}
          w="full"
          mx={{ base: 0, md: "auto" }}
          rounded={{ base: "none", md: "md" }}
          shadow="xl"
          borderWidth="1px"
        >
          <HStack px={{ base: 2, md: 3 }} py={{ base: 1.5, md: 2 }} borderBottomWidth="1px" justify="space-between">
            <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>{t("omniBar.title")}</Text>
            <HStack color="fg.muted" display={{ base: "none", sm: "flex" }} gap={1}>
              <Kbd fontSize="xs">Esc</Kbd>
              <Text fontSize="xs">{t("omniBar.toClose")}</Text>
            </HStack>
          </HStack>
          <Box p={{ base: 2, md: 3 }}>
            <Input
              autoFocus
              size={{ base: "md", md: "lg" }}
              placeholder={t("omniBar.searchPlaceholder")}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
            />
            <VStack align="stretch" gap={1} mt={3} maxH={{ base: "50vh", md: "60vh" }} overflowY="auto">
              {items.length === 0
                ? <Box px={2} py={3} color="fg.muted" fontSize={{ base: "xs", md: "sm" }}>{t("omniBar.noResults")}</Box>
                : (
                  items.map((it, idx) => (
                    <Suggestion
                      key={it.label + idx + (it.to || "")}
                      text={it.label}
                      hint={it.hint}
                      active={idx === active}
                      icon={it.icon}
                      onClick={() => {
                        if (it.to) navigate(it.to);
                        onClose();
                      }}
                    />
                  ))
                )}
            </VStack>
            <HStack
              justify="space-between"
              mt={3}
              color="fg.muted"
              fontSize={{ base: "xs", md: "sm" }}
              display={{ base: "none", sm: "flex" }}
            >
              <HStack gap={1}>
                <Kbd fontSize="xs">↑</Kbd>
                <Kbd fontSize="xs">↓</Kbd>
              </HStack>
              <HStack gap={1}>
                <Kbd fontSize="xs">Enter</Kbd>
                <Text>{t("omniBar.toRun")}</Text>
              </HStack>
            </HStack>
            <HStack justify="flex-end" mt={2}>
              <Button size="sm" variant="outline" onClick={onClose} minH={{ base: "36px", md: "auto" }}>
                {t("omniBar.close")}
              </Button>
            </HStack>
          </Box>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

interface SuggestionProps {
  text: string;
  hint?: string;
  active?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

function Suggestion({ text, hint, active, icon, onClick }: SuggestionProps) {
  return (
    <HStack
      justify="space-between"
      borderWidth="1px"
      rounded="md"
      px={{ base: 2, md: 3 }}
      py={{ base: 1.5, md: 2 }}
      cursor="pointer"
      bg={active ? "bg.subtle" : undefined}
      onClick={onClick}
      gap={2}
      _hover={{ bg: "bg.subtle" }}
      transition="background-color 0.15s"
    >
      <HStack gap={2} flex={1} minW={0}>
        {icon && (
          <Box color="fg.muted" flexShrink={0}>
            {icon}
          </Box>
        )}
        <Text fontSize={{ base: "xs", md: "sm" }} truncate flex={1}>{text}</Text>
      </HStack>
      {hint ? (
        <Badge 
          colorPalette="gray" 
          fontSize={{ base: "xs", md: "sm" }} 
          flexShrink={0}
          maxW="200px"
          css={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {hint}
        </Badge>
      ) : null}
    </HStack>
  );
}
