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

interface OmniBarItem {
  label: string;
  hint?: string;
  to?: string;
  kind: "navigate" | "action";
}

export interface OmniBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ITEMS: OmniBarItem[] = [
  {
    label: "Go to Generate",
    hint: "/generate",
    to: "/generate",
    kind: "navigate",
  },
  { label: "Go to Fix", hint: "/fix", to: "/fix", kind: "navigate" },
  { label: "Run Workflow", hint: "/run", to: "/run", kind: "navigate" },
  { label: "Open Plugins", hint: "/plugins", to: "/plugins", kind: "navigate" },
];

export function OmniBar({ isOpen, onClose }: OmniBarProps) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const navigate = useNavigate();

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEFAULT_ITEMS;
    return DEFAULT_ITEMS.filter((i) =>
      i.label.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q)
    );
  }, [query]);

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
        if (it?.to) navigate(it.to);
        onClose();
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
            <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Omni Bar</Text>
            <HStack color="fg.muted" display={{ base: "none", sm: "flex" }} gap={1}>
              <Kbd fontSize="xs">Esc</Kbd>
              <Text fontSize="xs">to close</Text>
            </HStack>
          </HStack>
          <Box p={{ base: 2, md: 3 }}>
            <Input
              autoFocus
              size={{ base: "md", md: "lg" }}
              placeholder="Search commands, navigate, or ask…"
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
            />
            <VStack align="stretch" gap={1} mt={3} maxH={{ base: "50vh", md: "60vh" }} overflowY="auto">
              {items.length === 0
                ? <Box px={2} py={3} color="fg.muted" fontSize={{ base: "xs", md: "sm" }}>No results</Box>
                : (
                  items.map((it, idx) => (
                    <Suggestion
                      key={it.label + idx}
                      text={it.label}
                      hint={it.hint}
                      active={idx === active}
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
                <Text>to run</Text>
              </HStack>
            </HStack>
            <HStack justify="flex-end" mt={2}>
              <Button size="sm" variant="outline" onClick={onClose} minH={{ base: "36px", md: "auto" }}>
                Close
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
  onClick?: () => void;
}

function Suggestion({ text, hint, active, onClick }: SuggestionProps) {
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
    >
      <Text fontSize={{ base: "xs", md: "sm" }} truncate>{text}</Text>
      {hint ? <Badge colorPalette="gray" fontSize={{ base: "xs", md: "sm" }} flexShrink={0}>{hint}</Badge> : null}
    </HStack>
  );
}
