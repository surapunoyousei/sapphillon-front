import React from "react";

export type KeyboardShortcut = {
  id: string;
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category?: string;
  action: () => void;
  disabled?: boolean;
};

export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  React.useEffect(() => {
    if (shortcut.disabled) return;

    const handler = (e: KeyboardEvent) => {
      const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
      const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatches = shortcut.alt ? e.altKey : !e.altKey;
      const metaMatches = shortcut.meta ? e.metaKey : !e.metaKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcut]);
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.disabled) continue;

        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatches = shortcut.alt ? e.altKey : !e.altKey;
        const metaMatches = shortcut.meta ? e.metaKey : !e.metaKey;

        if (
          keyMatches &&
          ctrlMatches &&
          shiftMatches &&
          altMatches &&
          metaMatches
        ) {
          e.preventDefault();
          shortcut.action();
          break; // 最初にマッチしたショートカットのみ実行
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}

// Format shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.meta) parts.push("⌘");

  parts.push(shortcut.key.toUpperCase());

  return parts.join(" + ");
}

// Get platform-specific modifier key (Cmd on Mac, Ctrl on Windows/Linux)
export function getModifierKey(): "meta" | "ctrl" {
  return navigator.platform.toLowerCase().includes("mac") ? "meta" : "ctrl";
}


