import React from "react";
import { Box, Drawer, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/nav/TopNav";
import { StatusBar } from "@/components/status/StatusBar";
import { OmniBar } from "@/components/omni/OmniBar";
import { SideNav } from "@/components/nav/SideNav";
import { KeyboardShortcutsDialog } from "@/components/ui/KeyboardShortcutsDialog";
import { MemoryRouter, useInRouterContext } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcut";
import { GLOBAL_SHORTCUTS, createShortcut } from "@/lib/keyboard-shortcuts";

export interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [omniOpen, setOmniOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = React.useState(false);
  const inRouter = useInRouterContext();
  const navigate = useNavigate();

  // グローバルキーボードショートカット
  const shortcuts = React.useMemo(() => {
    return [
      createShortcut(GLOBAL_SHORTCUTS.SEARCH, () => setOmniOpen(true)),
      createShortcut(GLOBAL_SHORTCUTS.HELP, () => setShortcutsDialogOpen(true)),
      createShortcut(GLOBAL_SHORTCUTS.HOME, () => navigate("/home")),
      createShortcut(GLOBAL_SHORTCUTS.GENERATE, () => navigate("/generate")),
      createShortcut(GLOBAL_SHORTCUTS.WORKFLOWS, () => navigate("/workflows")),
      createShortcut(GLOBAL_SHORTCUTS.SETTINGS, () => navigate("/settings")),
      createShortcut(GLOBAL_SHORTCUTS.REFRESH, () => window.location.reload()),
    ];
  }, [navigate]);

  useKeyboardShortcuts(shortcuts);

  return (
    <Flex direction="column" h="100dvh" overflow="hidden">
      <TopNav
        onOpenOmni={() => setOmniOpen(true)}
        onOpenMenu={() => setMobileMenuOpen(true)}
        showMenuButton={inRouter}
      />
      <Flex as="main" flex="1" minH="0" overflow="hidden">
        {/* デスクトップ用サイドナビ */}
        {inRouter
          ? (
            <Box
              as="aside"
              w={{ base: "0", lg: "56" }}
              display={{ base: "none", lg: "block" }}
              borderRightWidth="1px"
              py={3}
            >
              <SideNav />
            </Box>
          )
          : null}

        {/* モバイル用ドロワーメニュー */}
        {inRouter && (
          <Drawer.Root
            open={mobileMenuOpen}
            onOpenChange={(e) => setMobileMenuOpen(e.open)}
            placement="start"
            size="xs"
          >
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header borderBottomWidth="1px">
                  <Drawer.Title>Menu</Drawer.Title>
                </Drawer.Header>
                <Drawer.CloseTrigger />
                <Drawer.Body p={2} display="flex" flexDirection="column" h="full">
                  <SideNav onNavigate={() => setMobileMenuOpen(false)} />
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Drawer.Root>
        )}

        <Box
          id="main-content"
          flex="1"
          p={{ base: 2, md: 4 }}
          minH="0"
          minW="0"
          overflow="hidden"
          display="grid"
          gridTemplateRows="minmax(0, 1fr)"
          tabIndex={-1}
        >
          <Box minH="0" minW="0" overflow="hidden" h="full">
            {children}
          </Box>
        </Box>
      </Flex>
      <StatusBar />
      {inRouter
        ? <OmniBar isOpen={omniOpen} onClose={() => setOmniOpen(false)} />
        : (
          <MemoryRouter>
            <OmniBar isOpen={omniOpen} onClose={() => setOmniOpen(false)} />
          </MemoryRouter>
        )}
      
      {/* キーボードショートカット一覧ダイアログ */}
      <KeyboardShortcutsDialog
        open={shortcutsDialogOpen}
        onClose={() => setShortcutsDialogOpen(false)}
        shortcuts={shortcuts}
      />
    </Flex>
  );
}
