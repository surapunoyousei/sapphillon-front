import React from "react";

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
  starred?: boolean;
}

const HISTORY_KEY = "sapphillon-prompt-history";
const MAX_HISTORY_ITEMS = 50;

export function usePromptHistory() {
  const [history, setHistory] = React.useState<PromptHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 履歴を localStorage に保存
  React.useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save prompt history:", e);
    }
  }, [history]);

  // 新しいプロンプトを追加
  const addToHistory = React.useCallback((prompt: string) => {
    if (!prompt.trim()) return;

    const newItem: PromptHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt: prompt.trim(),
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // 既存の同じプロンプトを削除
      const filtered = prev.filter((item) => item.prompt !== prompt.trim());
      // 新しいアイテムを先頭に追加し、上限を超えた古いアイテムを削除
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  }, []);

  // 履歴アイテムを削除
  const removeFromHistory = React.useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 履歴をクリア
  const clearHistory = React.useCallback(() => {
    setHistory([]);
  }, []);

  // スター（お気に入り）の切り替え
  const toggleStar = React.useCallback((id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, starred: !item.starred } : item
      )
    );
  }, []);

  // スター付きアイテムのみを取得
  const starredHistory = React.useMemo(
    () => history.filter((item) => item.starred),
    [history]
  );

  return {
    history,
    starredHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleStar,
  } as const;
}
