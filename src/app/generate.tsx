import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Diff as DiffIcon,
  FileJson,
  ListTree,
  Sparkles,
  StopCircle,
  Trash2,
  Wand2,
  Zap,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";
import type {
  FixWorkflowRequest,
  FixWorkflowResponse,
  GenerateWorkflowRequest,
  GenerateWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb.ts";
import { Modal } from "@/components/ui/modal.tsx";
import { workflowClient } from "@/lib/grpc-clients.ts";
import { useStreamProgress } from "@/lib/hooks/use-stream-progress.ts";

// ============================================================================
// Types & Utility Functions
// ============================================================================

// --- Helpers --------------------------------------------------------------
// 受信した Workflow オブジェクト内の最新コードを行単位に分割して表示するための型
interface CodeLine {
  number: number;
  text: string;
}

interface WorkflowCodeJson {
  codeRevision?: number;
  code?: unknown;
}
interface WorkflowJson {
  workflowCode?: unknown;
}

const serializeWorkflow = (w: unknown): string => {
  if (!w) return "";
  try {
    return JSON.stringify(w, null, 2);
  } catch {
    return String(w);
  }
};

function extractLatestWorkflowCode(workflowJson: string): string {
  if (!workflowJson) return "";
  try {
    const parsed: unknown = JSON.parse(workflowJson);
    if (!parsed || typeof parsed !== "object") return "";
    const wf = parsed as WorkflowJson;
    const codes = Array.isArray(wf.workflowCode)
      ? wf.workflowCode.filter(
        (c): c is WorkflowCodeJson => !!c && typeof c === "object",
      )
      : [];
    if (!codes.length) return "";
    let latest = codes[0];
    for (const c of codes) {
      if (
        typeof c.codeRevision === "number" &&
        (latest.codeRevision ?? -1) < c.codeRevision
      ) {
        latest = c;
      }
    }
    return typeof latest.code === "string" ? latest.code : "";
  } catch {
    return "";
  }
}

function codeToLines(code: string): CodeLine[] {
  return code
    ? code
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((text, idx) => ({
        number: idx + 1,
        text,
      }))
    : [];
}

interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
}

// Simple line diff (replace-if-different). For more advanced diffing, introduce Myers algo later.
function buildSimpleDiff(prev: string, next: string): DiffLine[] {
  if (!prev && !next) return [];
  const a = prev.split(/\r?\n/);
  const b = next.split(/\r?\n/);
  const max = Math.max(a.length, b.length);
  const out: DiffLine[] = [];
  for (let i = 0; i < max; i++) {
    const la = a[i];
    const lb = b[i];
    if (la === lb) {
      if (la !== undefined) out.push({ type: "same", text: la });
    } else {
      if (la !== undefined) out.push({ type: "removed", text: la });
      if (lb !== undefined) out.push({ type: "added", text: lb });
    }
  }
  return out.slice(0, 800);
}

// ============================================================================
// Custom Hooks
// ============================================================================

interface UseWorkflowStreamsResult {
  prompt: string;
  setPrompt: (v: string) => void;
  hasGenerated: boolean;
  currentDefinition: string;
  previousDefinition: string;
  currentCode: string;
  previousCode: string;
  codeLines: CodeLine[];
  diffLines: DiffLine[];
  stepCount: number;
  isGenerating: boolean;
  isFixing: boolean;
  errorGenerate?: string;
  errorFix?: string;
  initiate: () => void;
  abortAll: () => void;
  resetAll: () => void;
  generateItems: GenerateWorkflowResponse[];
  fixItems: FixWorkflowResponse[];
  genDefinition: string;
  fixDefinition: string;
}

function useWorkflowStreams(): UseWorkflowStreamsResult {
  const [prompt, setPrompt] = useState("");

  const generate = useStreamProgress<GenerateWorkflowResponse>({
    extractErrorMessage: (item) =>
      item.status && item.status.code && item.status.code !== 0
        ? item.status.message || "Generation error"
        : undefined,
  });
  const fix = useStreamProgress<FixWorkflowResponse>({
    extractErrorMessage: (item) =>
      item.status && item.status.code && item.status.code !== 0
        ? item.status.message || "Fix error"
        : undefined,
  });

  const genDefinition = useMemo(() => {
    for (let i = generate.items.length - 1; i >= 0; i--) {
      const w = generate.items[i].workflowDefinition;
      if (w) return serializeWorkflow(w);
    }
    return "";
  }, [generate.items]);

  const fixDefinition = useMemo(() => {
    for (let i = fix.items.length - 1; i >= 0; i--) {
      const w = fix.items[i].fixedWorkflowDefinition;
      if (w) return serializeWorkflow(w);
    }
    return "";
  }, [fix.items]);

  const hasGenerated = !!genDefinition;
  const currentDefinition = fixDefinition || genDefinition;
  const previousDefinition = generate.items.length > 1
    ? serializeWorkflow(
      generate.items[generate.items.length - 2].workflowDefinition,
    )
    : "";
  const currentCode = useMemo(
    () => extractLatestWorkflowCode(currentDefinition),
    [currentDefinition],
  );
  const previousCode = useMemo(
    () => extractLatestWorkflowCode(previousDefinition),
    [previousDefinition],
  );
  const codeLines = useMemo(() => codeToLines(currentCode), [currentCode]);
  const diffLines = useMemo(
    () => buildSimpleDiff(previousCode, currentCode),
    [previousCode, currentCode],
  );
  const stepCount = codeLines.length;

  const initiate = useCallback(() => {
    if (!prompt.trim()) return;
    if (!hasGenerated) {
      generate.start(() =>
        workflowClient.generateWorkflow({ prompt } as GenerateWorkflowRequest)
      );
    } else if (genDefinition) {
      const fixReq = {
        workflowDefinition: genDefinition,
        description: prompt,
      } as FixWorkflowRequest;
      fix.start(() => workflowClient.fixWorkflow(fixReq));
    }
  }, [prompt, hasGenerated, genDefinition, generate, fix]);

  const abortAll = useCallback(() => {
    if (generate.isStreaming) generate.abort();
    if (fix.isStreaming) fix.abort();
  }, [generate, fix]);

  const resetAll = useCallback(() => {
    abortAll();
    generate.reset();
    fix.reset();
    setPrompt("");
  }, [abortAll, generate, fix]);

  return {
    prompt,
    setPrompt,
    hasGenerated,
    currentDefinition,
    previousDefinition,
    currentCode,
    previousCode,
    codeLines,
    diffLines,
    stepCount,
    isGenerating: generate.isStreaming,
    isFixing: fix.isStreaming,
    errorGenerate: generate.error ?? undefined,
    errorFix: fix.error ?? undefined,
    initiate,
    abortAll,
    resetAll,
    generateItems: generate.items,
    fixItems: fix.items,
    genDefinition,
    fixDefinition,
  };
}

// ============================================================================
// Presentational Sub Components (memoized)
// ============================================================================

interface PromptPanelProps {
  prompt: string;
  setPrompt: (v: string) => void;
  autoScrollLog: boolean;
  setAutoScrollLog: (v: boolean) => void;
  hasGenerated: boolean;
  isGenerating: boolean;
  isFixing: boolean;
  initiate: () => void;
  abortAll: () => void;
}
const PromptPanel = memo(function PromptPanel(props: PromptPanelProps) {
  const {
    prompt,
    setPrompt,
    autoScrollLog,
    setAutoScrollLog,
    hasGenerated,
    isGenerating,
    isFixing,
    initiate,
    abortAll,
  } = props;

  const isProcessing = isGenerating || isFixing;
  const currentAction = isGenerating ? "生成" : isFixing ? "修正" : "";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        initiate();
      }}
      className="card bg-gradient-to-br from-base-200/80 to-base-200/40 border border-base-300/60 shadow-lg flex flex-col h-full overflow-hidden backdrop-blur-sm"
    >
      <div className="card-body p-4 flex flex-col gap-3 h-full overflow-hidden">
        <div className="flex items-center justify-between flex-shrink-0">
          <h2 className="card-title text-sm flex items-center gap-2">
            <div
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isProcessing
                  ? "bg-primary/20 text-primary animate-pulse"
                  : "bg-primary/10 text-primary",
              )}
            >
              <Wand2 size={14} />
            </div>
            <span className="font-medium">ワークフロー生成</span>
            {isProcessing && (
              <div className="badge badge-primary badge-sm animate-pulse">
                {currentAction}中
              </div>
            )}
          </h2>
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs hover:text-base-content transition-colors">
            <input
              type="checkbox"
              className="checkbox checkbox-xs checkbox-primary"
              checked={autoScrollLog}
              onChange={(e) => setAutoScrollLog(e.target.checked)}
            />
            <span>自動スクロール</span>
          </label>
        </div>

        <div className="relative flex-1 min-h-0 overflow-hidden">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例: 天気API から情報を取得し、雨の場合はSlackに通知を送信するワークフローを作成してください"
            className={cn(
              "textarea textarea-bordered font-mono resize-none w-full h-full leading-relaxed text-sm transition-all duration-200",
              "placeholder:text-base-content/40 focus:ring-2 focus:ring-primary/20 focus:border-primary",
              isProcessing && "border-primary/40 bg-primary/5",
            )}
            disabled={isProcessing}
          />
          {isProcessing && (
            <div className="pointer-events-none absolute top-2 right-2">
              <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
                <Zap size={12} className="text-primary animate-pulse" />
                <span className="text-xs text-primary font-medium">
                  {currentAction}中...
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-xs pt-2 border-t border-base-300/30 flex-shrink-0">
          <div className="flex items-center gap-3 text-base-content/60">
            <span className="flex items-center gap-1">
              <kbd className="kbd kbd-xs">Ctrl</kbd>+
              <kbd className="kbd kbd-xs">Enter</kbd> で生成
            </span>
            <span className="text-base-content/40">|</span>
            <span className="flex items-center gap-1">
              <kbd className="kbd kbd-xs">Shift</kbd>+
              <kbd className="kbd kbd-xs">Enter</kbd> で改行
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!prompt.trim() || isProcessing}
              className={cn(
                "btn btn-sm gap-2 transition-all duration-200",
                hasGenerated
                  ? "btn-warning hover:btn-warning/80"
                  : "btn-primary hover:btn-primary/80",
                isProcessing && "loading",
              )}
            >
              {!isProcessing &&
                (hasGenerated ? <Zap size={14} /> : <Sparkles size={14} />)}
              {hasGenerated ? "修正" : "生成"}
            </button>
            {isProcessing && (
              <button
                type="button"
                onClick={abortAll}
                className="btn btn-sm btn-outline btn-error gap-2 hover:btn-error/80"
              >
                <StopCircle size={14} /> 停止
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
});

interface StreamLogProps {
  generateItems: GenerateWorkflowResponse[];
  fixItems: FixWorkflowResponse[];
  errorGenerate?: string;
  errorFix?: string;
  isGenerating: boolean;
  isFixing: boolean;
  autoScrollLog: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}
const StreamLog = memo(function StreamLog(props: StreamLogProps) {
  const {
    generateItems,
    fixItems,
    errorGenerate,
    errorFix,
    isGenerating,
    isFixing,
    autoScrollLog,
    expanded,
    onToggleExpand,
  } = props;

  const totalItems = generateItems.length + fixItems.length;
  const hasErrors = !!(errorGenerate || errorFix);
  const isProcessing = isGenerating || isFixing;

  const refSetter = useCallback(
    (el: HTMLDivElement | null) => {
      if (el && autoScrollLog) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
      }
    },
    [autoScrollLog, generateItems.length, fixItems.length],
  );

  return (
    <div className="card bg-gradient-to-br from-base-200/80 to-base-200/40 border border-base-300/60 shadow-lg flex flex-col h-full overflow-hidden backdrop-blur-sm">
      <div className="card-body gap-3 p-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between flex-shrink-0">
          <h2 className="card-title text-sm flex items-center gap-2">
            <div
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isProcessing
                  ? "bg-info/20 text-info animate-pulse"
                  : "bg-info/10 text-info",
                hasErrors && "bg-error/20 text-error",
              )}
            >
              <ListTree size={14} />
            </div>
            <span className="font-medium">ストリームログ</span>
            {totalItems > 0 && (
              <div
                className={cn(
                  "badge badge-sm",
                  hasErrors
                    ? "badge-error"
                    : isProcessing
                    ? "badge-info"
                    : "badge-success",
                )}
              >
                {totalItems}件
              </div>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-1 text-xs text-info">
                <div className="w-2 h-2 rounded-full bg-info animate-pulse">
                </div>
                <span>{isGenerating ? "生成中" : "修正中"}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onToggleExpand}
              className="btn btn-ghost btn-xs hover:btn-primary/10"
            >
              {expanded ? "折りたたむ" : "展開"}
            </button>
          </div>
        </div>

        {expanded && (
          <div
            ref={refSetter}
            className="space-y-3 overflow-auto text-xs font-mono pr-1 border border-base-300/40 rounded-lg p-3 bg-base-300/10 flex-1 min-h-0 backdrop-blur-sm"
          >
            {generateItems.map((_r, i) => (
              <div
                key={i}
                className="group p-3 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/30 hover:border-success/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-success" />
                    <span className="badge badge-success badge-sm">
                      生成完了 {i + 1}
                    </span>
                    <span className="text-sm font-medium text-success">
                      ワークフロー生成成功
                    </span>
                  </div>
                  <div className="text-xs text-success/70">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {fixItems.map((_r, i) => (
              <div
                key={"fix-" + i}
                className="group p-3 rounded-lg bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/30 hover:border-warning/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-warning" />
                    <span className="badge badge-warning badge-sm">
                      修正完了 {i + 1}
                    </span>
                    <span className="text-sm font-medium text-warning">
                      ワークフロー修正成功
                    </span>
                  </div>
                  <div className="text-xs text-warning/70">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {errorGenerate && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={12} className="text-error" />
                  <span className="text-error font-medium text-sm">
                    生成エラー
                  </span>
                </div>
                <p className="text-error/80 text-xs">{errorGenerate}</p>
              </div>
            )}

            {errorFix && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={12} className="text-error" />
                  <span className="text-error font-medium text-sm">
                    修正エラー
                  </span>
                </div>
                <p className="text-error/80 text-xs">{errorFix}</p>
              </div>
            )}

            {!totalItems && !isProcessing && (
              <div className="flex flex-col items-center justify-center py-8 text-base-content/50">
                <ListTree size={32} className="mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">ログが空です</p>
                <p className="text-xs">
                  プロンプトを入力してワークフローを生成してください
                </p>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-3">
                  <div className="loading loading-spinner loading-sm text-primary">
                  </div>
                  <span className="text-primary animate-pulse font-medium">
                    {isGenerating
                      ? "ワークフローを生成中..."
                      : "ワークフローを修正中..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

interface StepsViewProps {
  codeLines: CodeLine[];
}
const StepsView = memo(function StepsView({ codeLines }: StepsViewProps) {
  if (!codeLines.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-base-content/50 p-8">
        <div className="w-20 h-20 rounded-full bg-base-300/30 flex items-center justify-center mb-4">
          <FileJson size={32} className="opacity-50" />
        </div>
        <h3 className="font-medium text-base-content/70 mb-2">
          コードが生成されていません
        </h3>
        <p className="text-sm text-center max-w-md">
          プロンプトを入力してワークフローを生成すると、ここにステップごとのコードが表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto pr-2">
        <div className="space-y-2">
          {codeLines.map((ln, index) => (
            <div
              key={ln.number}
              className={cn(
                "group border border-base-300/40 bg-gradient-to-r from-base-100/80 to-base-100/40",
                "hover:from-primary/5 hover:to-primary/10 hover:border-primary/30",
                "transition-all duration-200 rounded-lg px-3 py-2 flex items-start gap-3 font-mono",
                "shadow-sm hover:shadow-md",
              )}
            >
              <div className="flex items-center gap-2 mt-0.5 flex-shrink-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    index === 0 &&
                      "bg-success/20 text-success border-2 border-success/30",
                    index === codeLines.length - 1 &&
                      index > 0 &&
                      "bg-info/20 text-info border-2 border-info/30",
                    index > 0 &&
                      index < codeLines.length - 1 &&
                      "bg-base-300/60 text-base-content/60 border-2 border-base-300/40",
                  )}
                >
                  {ln.number}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <pre className="text-xs leading-relaxed whitespace-pre-wrap break-words text-base-content/90 overflow-auto max-h-32">
                  {ln.text || (
                    <span className="text-base-content/30 italic">空行</span>
                  )}
                </pre>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(ln.text)}
                  className="btn btn-ghost btn-xs"
                  title="この行をコピー"
                >
                  <Copy size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-base-200/50 rounded-lg border border-base-300/40 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-base-content/60">
          <span>総ステップ数: {codeLines.length}</span>
          <span>最終更新: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
});

interface DiffViewProps {
  diffLines: DiffLine[];
}
const DiffView = memo(function DiffView({ diffLines }: DiffViewProps) {
  if (!diffLines.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-base-content/50 p-8">
        <div className="w-20 h-20 rounded-full bg-base-300/30 flex items-center justify-center mb-4">
          <DiffIcon size={32} className="opacity-50" />
        </div>
        <h3 className="font-medium text-base-content/70 mb-2">
          差分がありません
        </h3>
        <p className="text-sm text-center max-w-md">
          ワークフローを修正すると、ここに前回との差分が表示されます。
        </p>
      </div>
    );
  }

  const addedCount = diffLines.filter((l) => l.type === "added").length;
  const removedCount = diffLines.filter((l) => l.type === "removed").length;
  const unchangedCount = diffLines.filter((l) => l.type === "same").length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 p-3 bg-base-200/50 rounded-lg border border-base-300/40">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success/80"></div>
            <span className="text-success font-medium">+{addedCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-error/80"></div>
            <span className="text-error font-medium">-{removedCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-base-400/60"></div>
            <span className="text-base-content/60">{unchangedCount}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const diffText = diffLines
              .map(
                (l) =>
                  `${
                    l.type === "added" ? "+" : l.type === "removed" ? "-" : " "
                  } ${l.text}`,
              )
              .join("\n");
            navigator.clipboard.writeText(diffText);
          }}
          className="btn btn-ghost btn-xs gap-1"
          title="差分をコピー"
        >
          <Copy size={10} /> コピー
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 rounded-lg bg-base-300/10 border border-base-300/40 font-mono text-xs space-y-0.5">
        {diffLines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "px-3 py-1.5 rounded leading-relaxed break-all transition-all hover:shadow-sm",
              l.type === "added" &&
                "bg-success/15 border-l-4 border-success/50 text-success-content",
              l.type === "removed" &&
                "bg-error/15 border-l-4 border-error/50 text-error-content line-through opacity-80",
              l.type === "same" && "text-base-content/70 hover:bg-base-200/30",
            )}
          >
            <span
              className={cn(
                "inline-block w-6 font-bold",
                l.type === "added" && "text-success",
                l.type === "removed" && "text-error",
                l.type === "same" && "text-base-content/40",
              )}
            >
              {l.type === "added" ? "+" : l.type === "removed" ? "-" : " "}
            </span>
            {l.text || (
              <span className="text-base-content/30 italic">空行</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

// --- Main Component -------------------------------------------------------
export function Generate() {
  // Core workflow streaming state & logic
  const wf = useWorkflowStreams();

  // UI local state
  const [previewTab, setPreviewTab] = useState<
    "steps" | "json" | "raw" | "diff"
  >("steps");
  const [autoScrollLog, setAutoScrollLog] = useState(true);
  const [expandedLog, setExpandedLog] = useState(true);
  const [promptHeightRatio, setPromptHeightRatio] = useState(0.55);
  const [discardOpen, setDiscardOpen] = useState(false);

  // Split drag handling
  const draggingRef = useRef(false);
  const colRef = useRef<HTMLDivElement | null>(null);
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
  }, []);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!draggingRef.current || !colRef.current) return;
      const rect = colRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      setPromptHeightRatio(Math.min(0.85, Math.max(0.15, y / rect.height)));
    };
    const up = () => {
      draggingRef.current = false;
    };
    globalThis.addEventListener("mousemove", move);
    globalThis.addEventListener("mouseup", up);
    return () => {
      globalThis.removeEventListener("mousemove", move);
      globalThis.removeEventListener("mouseup", up);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        wf.initiate();
      }
      if (e.key === "Escape" && (wf.isGenerating || wf.isFixing)) wf.abortAll();
    };
    globalThis.addEventListener("keydown", h);
    return () => globalThis.removeEventListener("keydown", h);
  }, [wf]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex flex-row gap-4 h-full overflow-hidden p-4">
        {/* Left Column with resizable split */}
        <div
          ref={colRef}
          className="flex flex-col w-full md:w-1/3 md:min-w-96 h-full overflow-hidden"
        >
          <div className="h-full flex flex-col overflow-hidden">
            {/* Prompt Panel */}
            <div
              style={{
                height: `calc(${Math.round(promptHeightRatio * 100)}% - 6px)`,
                minHeight: "120px",
              }}
              className="overflow-hidden"
            >
              <PromptPanel
                prompt={wf.prompt}
                setPrompt={wf.setPrompt}
                autoScrollLog={autoScrollLog}
                setAutoScrollLog={setAutoScrollLog}
                hasGenerated={wf.hasGenerated}
                isGenerating={wf.isGenerating}
                isFixing={wf.isFixing}
                initiate={wf.initiate}
                abortAll={wf.abortAll}
              />
            </div>

            {/* Drag handle */}
            <div
              role="separator"
              aria-orientation="horizontal"
              onMouseDown={onDragStart}
              className="h-1 rounded bg-base-300/60 hover:bg-primary/60 transition cursor-row-resize my-2 flex-shrink-0"
              title="ドラッグしてサイズ変更"
              style={{ userSelect: "none" }}
            />

            {/* Stream Log */}
            <div
              style={{
                height: `calc(${
                  Math.round((1 - promptHeightRatio) * 100)
                }% - 6px)`,
                minHeight: "120px",
              }}
              className="overflow-hidden"
            >
              <StreamLog
                generateItems={wf.generateItems}
                fixItems={wf.fixItems}
                errorGenerate={wf.errorGenerate}
                errorFix={wf.errorFix}
                isGenerating={wf.isGenerating}
                isFixing={wf.isFixing}
                autoScrollLog={autoScrollLog}
                expanded={expandedLog}
                onToggleExpand={() => setExpandedLog(!expandedLog)}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col flex-1 h-full min-w-96 overflow-hidden">
          <div className="card bg-gradient-to-br from-base-200/80 to-base-200/40 border border-base-300/60 shadow-lg h-full flex flex-col backdrop-blur-sm overflow-hidden">
            <div className="card-body gap-4 p-4 flex flex-col h-full overflow-hidden">
              {/* Enhanced Tab Header */}
              <div className="flex items-center justify-between border-b border-base-300/50 pb-3 flex-shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("steps")}
                    className={cn(
                      "tab tab-sm gap-2 transition-all duration-200 whitespace-nowrap",
                      previewTab === "steps"
                        ? "tab-active bg-primary/10 text-primary font-medium border-primary"
                        : "hover:bg-base-300/20",
                    )}
                  >
                    <ListTree size={14} />
                    ステップ
                    {wf.stepCount > 0 && (
                      <div className="badge badge-primary badge-xs">
                        {wf.stepCount}
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("json")}
                    className={cn(
                      "tab tab-sm gap-2 transition-all duration-200 whitespace-nowrap",
                      previewTab === "json"
                        ? "tab-active bg-primary/10 text-primary font-medium border-primary"
                        : "hover:bg-base-300/20",
                    )}
                  >
                    <FileJson size={14} />
                    整形JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("raw")}
                    className={cn(
                      "tab tab-sm gap-2 transition-all duration-200 whitespace-nowrap",
                      previewTab === "raw"
                        ? "tab-active bg-primary/10 text-primary font-medium border-primary"
                        : "hover:bg-base-300/20",
                    )}
                  >
                    <FileJson size={14} />
                    RAW
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("diff")}
                    disabled={wf.generateItems.length < 2}
                    className={cn(
                      "tab tab-sm gap-2 transition-all duration-200 whitespace-nowrap",
                      previewTab === "diff"
                        ? "tab-active bg-primary/10 text-primary font-medium border-primary"
                        : "hover:bg-base-300/20",
                      wf.generateItems.length < 2 &&
                        "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <DiffIcon size={14} />
                    Diff
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (wf.currentDefinition) {
                        navigator.clipboard.writeText(wf.currentDefinition);
                      }
                    }}
                    disabled={!wf.currentDefinition}
                    className="btn btn-xs btn-ghost gap-1 hover:btn-primary/10"
                    title="定義をクリップボードにコピー"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("json")}
                    disabled={!wf.currentDefinition}
                    className="btn btn-xs btn-outline btn-info gap-1"
                    title="整形されたJSONを表示"
                  >
                    <FileJson size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("diff")}
                    disabled={wf.generateItems.length < 2}
                    className="btn btn-xs btn-outline btn-warning gap-1"
                    title="変更履歴を表示"
                  >
                    <DiffIcon size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscardOpen(true)}
                    disabled={!(wf.genDefinition || wf.fixDefinition)}
                    className="btn btn-xs btn-error btn-outline gap-1"
                    title="現在のワークフローを破棄"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="relative flex-1 overflow-hidden">
                {previewTab === "steps" && (
                  <StepsView codeLines={wf.codeLines} />
                )}
                {previewTab === "json" && (
                  <div className="h-full overflow-auto">
                    <pre className="p-4 rounded-lg bg-base-300/20 border border-base-300/40 text-xs font-mono whitespace-pre text-base-content/90 leading-relaxed">
                      {wf.currentDefinition || "定義が生成されていません"}
                    </pre>
                  </div>
                )}
                {previewTab === "raw" && (
                  <div className="h-full overflow-auto">
                    <pre className="p-4 rounded-lg bg-base-300/20 border border-base-300/40 text-xs font-mono whitespace-pre-wrap break-all text-base-content/80 leading-relaxed">
                      {wf.currentDefinition || "定義が生成されていません"}
                    </pre>
                  </div>
                )}
                {previewTab === "diff" && <DiffView diffLines={wf.diffLines} />}

                {/* Loading Overlay */}
                {!wf.currentDefinition &&
                  (wf.isGenerating || wf.isFixing) &&
                  previewTab !== "diff" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-base-200/50 backdrop-blur-sm rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                      <div className="loading loading-spinner loading-lg text-primary">
                      </div>
                      <span className="text-primary font-medium">
                        {wf.isGenerating
                          ? "ワークフローを構築中..."
                          : "ワークフローを修正中..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="pt-3 border-t border-base-300/40 text-xs flex items-center justify-between text-base-content/60 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-info"></div>
                    Partials: {wf.generateItems.length + wf.fixItems.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    Lines: {wf.stepCount}
                  </span>
                  {(wf.isGenerating || wf.isFixing) && (
                    <span className="flex items-center gap-1 text-primary animate-pulse font-medium">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse">
                      </div>
                      {wf.isGenerating ? "Streaming..." : "Fixing..."}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {wf.errorGenerate && (
                    <span className="flex items-center gap-1 text-error">
                      <AlertCircle size={12} />
                      生成エラー
                    </span>
                  )}
                  {wf.errorFix && (
                    <span className="flex items-center gap-1 text-error">
                      <AlertCircle size={12} />
                      修正エラー
                    </span>
                  )}
                  {wf.currentDefinition && (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 size={12} />
                      準備完了
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="ワークフロー破棄の確認"
        size="sm"
        actions={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDiscardOpen(false)}
            >
              キャンセル
            </button>
            <button
              type="button"
              className="btn btn-error"
              data-autofocus
              onClick={() => {
                wf.resetAll();
                setDiscardOpen(false);
              }}
            >
              破棄する
            </button>
          </>
        }
      >
        <p className="leading-relaxed text-sm">
          現在の生成 / 修正結果とプロンプト内容をすべて初期化します。
          <br />
          この操作は元に戻せません。実行してよろしいですか？
        </p>
      </Modal>
    </div>
  );
}
