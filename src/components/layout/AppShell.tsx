/**
 * @fileoverview アプリケーション全体のレイアウトシェル
 *
 * トップナビ、サイドナビ、ステータスバー、オムニバーを含む
 * 統一されたレイアウトを提供します。
 *
 * @module components/layout/AppShell
 */

import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/nav/TopNav";
import { StatusBar } from "@/components/status/StatusBar";
import { OmniBar } from "@/components/omni/OmniBar";
import { KeyboardShortcutsDialog } from "@/components/ui/KeyboardShortcutsDialog";
import { MemoryRouter, useInRouterContext } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcut";
import { GLOBAL_SHORTCUTS, createShortcut } from "@/lib/keyboard-shortcuts";

/**
 * AppShellコンポーネントのProps
 */
export interface AppShellProps {
  /** レイアウト内に表示する子要素 */
  children?: React.ReactNode;
}

/**
 * アプリケーションレイアウトシェル
 *
 * 全ページで共通のレイアウト構造を提供します。
 * - トップナビゲーションバー
 * - サイドナビゲーション（モバイルではドロワー）
 * - メインコンテンツエリア
 * - ステータスバー
 * - オムニバー（⌘K で起動）
 *
 * ## 機能
 * - レスポンシブデザイン
 * - キーボードショートカット（⌘K でオムニバー）
 * - ルーター対応
 * - モバイル用ドロワーメニュー
 *
 * @example
 * ```tsx
 * import { AppShell } from '@/components/layout/AppShell';
 *
 * function App() {
 *   return (
 *     <AppShell>
 *       <Routes>
 *         <Route path="/" element={<HomePage />} />
 *         <Route path="/generate" element={<GeneratePage />} />
 *       </Routes>
 *     </AppShell>
 *   );
 * }
 * ```
 */
export function AppShell({ children }: AppShellProps) {
  const [omniOpen, setOmniOpen] = React.useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = React.useState(false);
  const inRouter = useInRouterContext();
  const navigate = useNavigate();

  // グローバルキーボードショートカット
  const shortcuts = React.useMemo(() => {
    return [
      createShortcut(GLOBAL_SHORTCUTS.SEARCH, () => setOmniOpen(true)),
      createShortcut(GLOBAL_SHORTCUTS.HELP, () => setShortcutsDialogOpen(true)),
      createShortcut(GLOBAL_SHORTCUTS.HOME, () => navigate("/home")),
      createShortcut(GLOBAL_SHORTCUTS.SETTINGS, () => navigate("/settings")),
      createShortcut(GLOBAL_SHORTCUTS.REFRESH, () => window.location.reload()),
    ];
  }, [navigate]);

  useKeyboardShortcuts(shortcuts);

  return (
    <Flex direction="column" h="100dvh" overflow="hidden">
      <TopNav
        onOpenOmni={() => setOmniOpen(true)}
      />
      <Flex as="main" flex="1" minH="0" overflow="hidden">
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
