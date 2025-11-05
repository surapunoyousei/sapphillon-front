/**
 * @fileoverview テキスト処理のユーティリティ関数
 *
 * @module components/workflow/utils/text-utils
 */

/**
 * コードを1行に整形し、最大文字数で切り詰める
 *
 * @param code - 整形するコード文字列
 * @param maxLength - 最大文字数（デフォルト: 80）
 * @returns 整形されたコード文字列
 *
 * @example
 * ```typescript
 * const result = oneLine("function foo() {\n  return 42;\n}", 20);
 * console.log(result); // "function foo() { re…"
 * ```
 */
export function oneLine(
  code: string | null | undefined,
  maxLength = 80,
): string {
  const normalized = (code ?? "").replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return normalized.slice(0, maxLength - 1) + "…";
}

/**
 * コードを複数行に分割し、指定された最大行数で切り詰める
 *
 * @param code - 分割するコード文字列
 * @param maxLines - 最大行数
 * @returns 分割されたコード行の配列
 */
export function splitLines(code: string, maxLines?: number): string[] {
  const lines = code.split("\n");

  if (maxLines && lines.length > maxLines) {
    return [...lines.slice(0, maxLines), "..."];
  }

  return lines;
}

/**
 * コードをハイライト用にエスケープ
 *
 * HTMLタグをエスケープして安全に表示できるようにします。
 *
 * @param code - エスケープするコード文字列
 * @returns エスケープされた文字列
 */
export function escapeCode(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 複数のテキストを結合し、区切り文字で連結
 *
 * @param texts - 結合するテキストの配列
 * @param separator - 区切り文字（デフォルト: ", "）
 * @returns 結合されたテキスト
 */
export function joinTexts(
  texts: (string | null | undefined)[],
  separator = ", ",
): string {
  return texts.filter(Boolean).join(separator);
}

