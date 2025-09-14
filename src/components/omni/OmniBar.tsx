import React from "react";
import { Badge, Box, Button, HStack, Input, Kbd, Text, VStack, Dialog } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

type Item = { label: string; hint?: string; to?: string; kind: "navigate" | "action" };

const DEFAULT_ITEMS: Item[] = [
  { label: "Go to Generate", hint: "/generate", to: "/generate", kind: "navigate" },
  { label: "Go to Fix", hint: "/fix", to: "/fix", kind: "navigate" },
  { label: "Run Workflow", hint: "/run", to: "/run", kind: "navigate" },
  { label: "Open Plugins", hint: "/plugins", to: "/plugins", kind: "navigate" },
];

export function OmniBar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const navigate = useNavigate();

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEFAULT_ITEMS;
    return DEFAULT_ITEMS.filter((i) =>
      i.label.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q),
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
    <Dialog.Root open={isOpen} onOpenChange={(details) => { if (!details.open) onClose(); }}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="2xl" w="full" rounded="md" shadow="xl" borderWidth="1px">
          <HStack px={3} py={2} borderBottomWidth="1px" justify="space-between">
            <Text fontWeight="medium">Omni Bar</Text>
            <HStack color="fg.muted">
              <Kbd>Esc</Kbd>
              <Text fontSize="sm">to close</Text>
            </HStack>
          </HStack>
          <Box p={3}>
            <Input
              autoFocus
              size="lg"
              placeholder="Search commands, navigate, or ask…"
              placeholder="Search commands, navigate, or ask…"
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
            />
            <VStack align="stretch" gap={1} mt={3} maxH="60vh" overflowY="auto">
              {items.length === 0 ? (
                <Box px={2} py={3} color="fg.muted">No results</Box>
              ) : (
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
            <HStack justify="space-between" mt={3} color="fg.muted" fontSize="sm">
              <HStack>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
              </HStack>
              <HStack>
                <Kbd>Enter</Kbd>
                <Text>to run</Text>
              </HStack>
            </HStack>
            <HStack justify="flex-end" mt={2}>
              <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
            </HStack>
          </Box>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

function Suggestion(
  { text, hint, active, onClick }: { text: string; hint?: string; active?: boolean; onClick?: () => void },
) {
  return (
    <HStack
      justify="space-between"
      borderWidth="1px"
      rounded="md"
      px={3}
      py={2}
      cursor="pointer"
      bg={active ? "bg.subtle" : undefined}
      onClick={onClick}
    >
      <Text>{text}</Text>
      {hint ? <Badge colorPalette="gray">{hint}</Badge> : null}
    </HStack>
  );
}
