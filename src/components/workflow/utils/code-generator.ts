/**
 * @fileoverview Babel ASTノードからJavaScriptコードを生成するユーティリティ
 *
 * @module components/workflow/utils/code-generator
 */

import generate from "@babel/generator";
import type { Node } from "@babel/types";

/**
 * コード生成オプション
 */
export interface GenerateOptions {
  /** コードをコンパクトに出力するか */
  compact?: boolean;
  /** コメントを含めるか */
  comments?: boolean;
  /** 簡潔な出力にするか */
  concise?: boolean;
}

/**
 * Babel ASTノードからJavaScriptコードを生成
 *
 * @param node - 変換するASTノード
 * @param options - 生成オプション
 * @returns 生成されたJavaScriptコード
 *
 * @example
 * ```typescript
 * const code = generateCode(astNode, { compact: false });
 * console.log(code); // "function foo() { return 42; }"
 * ```
 */
export function generateCode(
  node: Node | null | undefined,
  options?: GenerateOptions,
): string {
  if (!node) return "";

  try {
    // @ts-expect-error @babel/generator's ESM/CJS module is a bit weird.
    const generator = generate.default ?? generate;
    const { code } = generator(node, {
      compact: options?.compact ?? true,
      comments: options?.comments ?? false,
      concise: options?.concise ?? true,
    });
    return code;
  } catch (error) {
    console.warn("Failed to generate code for node:", error);
    return "[Code generation failed]";
  }
}

/**
 * コンパクトなコード生成（デフォルト）
 */
export function generateCompactCode(node: Node | null | undefined): string {
  return generateCode(node, {
    compact: true,
    comments: false,
    concise: true,
  });
}

/**
 * 読みやすい形式でコード生成
 */
export function generateReadableCode(node: Node | null | undefined): string {
  return generateCode(node, {
    compact: false,
    comments: false,
    concise: false,
  });
}

