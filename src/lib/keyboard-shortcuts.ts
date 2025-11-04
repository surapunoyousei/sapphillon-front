import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { getModifierKey } from "@/hooks/useKeyboardShortcut";

const modifierKey = getModifierKey();

// グローバルショートカット定義
export const GLOBAL_SHORTCUTS = {
  // ナビゲーション
  HOME: {
    id: "nav-home",
    key: "h",
    [modifierKey]: true,
    description: "ホームページに移動",
    category: "ナビゲーション",
  },
  GENERATE: {
    id: "nav-generate",
    key: "g",
    [modifierKey]: true,
    description: "生成ページに移動",
    category: "ナビゲーション",
  },
  WORKFLOWS: {
    id: "nav-workflows",
    key: "w",
    [modifierKey]: true,
    description: "ワークフローページに移動",
    category: "ナビゲーション",
  },
  SETTINGS: {
    id: "nav-settings",
    key: ",",
    [modifierKey]: true,
    description: "設定ページに移動",
    category: "ナビゲーション",
  },

  // アクション
  SEARCH: {
    id: "action-search",
    key: "k",
    [modifierKey]: true,
    description: "検索を開く",
    category: "アクション",
  },
  HELP: {
    id: "action-help",
    key: "?",
    shift: true,
    description: "ヘルプ・ショートカット一覧を表示",
    category: "アクション",
  },
  REFRESH: {
    id: "action-refresh",
    key: "r",
    [modifierKey]: true,
    description: "ページを更新",
    category: "アクション",
  },

  // 生成ページ
  GENERATE_SUBMIT: {
    id: "generate-submit",
    key: "Enter",
    [modifierKey]: true,
    description: "プロンプトを送信してワークフローを生成",
    category: "生成",
  },
  GENERATE_STOP: {
    id: "generate-stop",
    key: "Escape",
    description: "生成を停止",
    category: "生成",
  },
  GENERATE_CLEAR: {
    id: "generate-clear",
    key: "l",
    [modifierKey]: true,
    description: "プロンプトをクリア",
    category: "生成",
  },
  GENERATE_TEMPLATES: {
    id: "generate-templates",
    key: "t",
    [modifierKey]: true,
    description: "テンプレートを開く",
    category: "生成",
  },
  GENERATE_HISTORY: {
    id: "generate-history",
    key: "h",
    [modifierKey]: true,
    shift: true,
    description: "履歴を開く",
    category: "生成",
  },

  // ワークフロー
  WORKFLOW_RUN: {
    id: "workflow-run",
    key: "r",
    [modifierKey]: true,
    shift: true,
    description: "ワークフローを実行",
    category: "ワークフロー",
  },
  WORKFLOW_CLONE: {
    id: "workflow-clone",
    key: "d",
    [modifierKey]: true,
    description: "ワークフローを複製",
    category: "ワークフロー",
  },
  WORKFLOW_SAVE: {
    id: "workflow-save",
    key: "s",
    [modifierKey]: true,
    description: "ワークフローを保存",
    category: "ワークフロー",
  },
} as const;

// ショートカット定義からKeyboardShortcutオブジェクトを生成
export function createShortcut(
  definition: Partial<KeyboardShortcut>,
  action: () => void,
  disabled?: boolean
): KeyboardShortcut {
  return {
    ...definition,
    action,
    disabled,
  } as KeyboardShortcut;
}

// プラットフォーム別のモディファイアキー表示名
export function getModifierKeyLabel(): string {
  return getModifierKey() === "meta" ? "⌘" : "Ctrl";
}


