/**
 * @fileoverview ワークフロー関連の定数定義
 *
 * @module components/workflow/constants
 */

/**
 * ワークフローノードのインデント幅
 */
export const INDENT = {
  /** デスクトップ表示時のインデント幅（px） */
  desktop: 16,
  /** モバイル表示時のインデント幅（px） */
  mobile: 12,
} as const;

/**
 * ノードタイプの定義
 */
export const NODE_TYPES = {
  VARIABLE: "variable",
  RETURN: "return",
  EXPRESSION: "expression",
  CALL: "call",
  IF: "if",
  LOOP: "loop",
  TRY_CATCH: "try-catch",
  BLOCK: "block",
  UNKNOWN: "unknown",
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

/**
 * アクションタイプの定義
 */
export const ACTION_TYPES = {
  NAVIGATION: "navigation",
  INTERACTION: "interaction",
  DATA_EXTRACTION: "data-extraction",
  CONTROL_FLOW: "control-flow",
  RETURN: "return",
  COMPUTATION: "computation",
} as const;

export type ActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

/**
 * 重要度の定義
 */
export const IMPORTANCE_LEVELS = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type ImportanceLevel =
  (typeof IMPORTANCE_LEVELS)[keyof typeof IMPORTANCE_LEVELS];

/**
 * アクションタイプごとのカラーパレット
 */
export const ACTION_COLORS: Record<
  ActionType,
  { high: string; medium: string; low: string }
> = {
  [ACTION_TYPES.NAVIGATION]: { high: "blue", medium: "blue", low: "gray" },
  [ACTION_TYPES.INTERACTION]: { high: "purple", medium: "purple", low: "gray" },
  [ACTION_TYPES.DATA_EXTRACTION]: { high: "green", medium: "green", low: "gray" },
  [ACTION_TYPES.CONTROL_FLOW]: { high: "orange", medium: "orange", low: "gray" },
  [ACTION_TYPES.RETURN]: { high: "pink", medium: "pink", low: "gray" },
  [ACTION_TYPES.COMPUTATION]: { high: "cyan", medium: "cyan", low: "gray" },
} as const;

/**
 * ノードタイプごとのカラーパレット
 */
export const NODE_COLORS = {
  variable: "purple",
  return: "green",
  call: "teal",
  expression: "cyan",
  condition: "amber",
  loop: "blue",
  error: "red",
  default: "gray",
} as const;

/**
 * アクションタイプに基づいてカラースキームを取得
 *
 * @param type - アクションタイプ
 * @param importance - 重要度
 * @returns カラースキーム名
 *
 * @example
 * ```typescript
 * const color = getActionColor("navigation", "high"); // "blue"
 * ```
 */
export function getActionColor(
  type: ActionType,
  importance: ImportanceLevel = "low",
): string {
  return ACTION_COLORS[type]?.[importance] ?? "gray";
}

/**
 * ノードタイプに基づいてカラースキームを取得
 *
 * @param type - ノードタイプ
 * @returns カラースキーム名
 */
export function getNodeColor(type: string): string {
  return NODE_COLORS[type as keyof typeof NODE_COLORS] ?? NODE_COLORS.default;
}

/**
 * アニメーション設定
 */
export const ANIMATIONS = {
  /** トランジション時間 */
  transitionDuration: "0.2s",
  /** イージング関数 */
  transitionTiming: "ease-in-out",
  /** ホバー時のシャドウ */
  hoverShadow: "md",
} as const;

/**
 * 重要な関数名のパターン
 *
 * これらの関数呼び出しは「重要処理」としてハイライトされます。
 */
export const IMPORTANT_FUNCTIONS = [
  "navigate",
  "click",
  "fill",
  "select",
  "submit",
  "waitFor",
  "screenshot",
  "evaluate",
] as const;

/**
 * 関数呼び出しが重要かどうかを判定
 *
 * @param functionName - 関数名
 * @returns 重要な関数であればtrue
 */
export function isImportantFunction(functionName: string): boolean {
  return IMPORTANT_FUNCTIONS.some((fn) =>
    functionName.toLowerCase().includes(fn.toLowerCase())
  );
}

/**
 * ビューモードの定義
 */
export const VIEW_MODES = {
  ACTIONS: "actions",
  STEPS: "steps",
  CODE: "code",
} as const;

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];

/**
 * コード表示の最大行数
 */
export const MAX_CODE_LINES = 1000;

/**
 * ノードの最大ネスト深度（これを超えるとワーニング）
 */
export const MAX_NEST_DEPTH = 10;

