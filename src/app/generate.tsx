import {
  Copy,
  Diff as DiffIcon,
  FileJson,
  ListTree,
  Play,
  Sparkles,
  StopCircle,
  Trash2,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";
import {
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
      ? wf.workflowCode.filter((c): c is WorkflowCodeJson =>
        !!c && typeof c === "object"
      )
      : [];
    if (!codes.length) return "";
    let latest = codes[0];
    for (const c of codes) {
      if (
        typeof c.codeRevision === "number" &&
        (latest.codeRevision ?? -1) < c.codeRevision
      ) latest = c;
    }
    return typeof latest.code === "string" ? latest.code : "";
  } catch {
    return "";
  }
}

function codeToLines(code: string): CodeLine[] {
  return code
    ? code.replace(/\r\n?/g, "\n").split("\n").map((text, idx) => ({
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
  const diffLines = useMemo(() => buildSimpleDiff(previousCode, currentCode), [
    previousCode,
    currentCode,
  ]);
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
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        initiate();
      }}
      className="card bg-base-200/50 border border-base-300 shadow-sm flex flex-col min-h-0 mb-2 overflow-hidden flex-1"
    >
      <div className="card-body p-4 flex flex-col gap-3 min-h-0">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-sm flex items-center gap-2">
            <Sparkles size={14} /> プロンプト
          </h2>
          <label className="flex items-center gap-1 cursor-pointer select-none text-xs">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={autoScrollLog}
              onChange={(e) => setAutoScrollLog(e.target.checked)}
            />
            <span>自動スクロール</span>
          </label>
        </div>
        <div className="relative flex-1 min-h-0">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例: 天気を確認して雨なら通知するワークフローを作成"
            className="textarea textarea-bordered font-mono resize-none w-full h-full leading-relaxed text-sm"
          />
          {isGenerating && !prompt && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-base-content/40 text-xs">
              ストリーミング中...
            </div>
          )}
        </div>
        <div className="flex justify-between items-center text-[11px] pt-1">
          <span className="text-base-content/60">
            Ctrl+Enter で生成 / Shift+Enter で改行
          </span>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating || isFixing}
              className="btn btn-sm btn-primary gap-1"
            >
              <Play size={14} /> {hasGenerated ? "修正" : "生成"}
            </button>
            {(isGenerating || isFixing) && (
              <button
                type="button"
                onClick={abortAll}
                className="btn btn-sm btn-outline gap-1"
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
  const refSetter = useCallback((el: HTMLDivElement | null) => {
    if (el && autoScrollLog) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [autoScrollLog, generateItems.length, fixItems.length]);
  return (
    <div className="card bg-base-200/50 border border-base-300 shadow-sm flex flex-col overflow-hidden flex-1">
      <div className="card-body gap-3 p-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="card-title text-sm flex items-center gap-2">
            <ListTree size={14} /> ストリームログ
          </h2>
          <button
            type="button"
            onClick={onToggleExpand}
            className="btn btn-ghost btn-xs"
          >
            {expanded ? "折りたたむ" : "展開"}
          </button>
        </div>
        {expanded && (
          <div
            ref={refSetter}
            className="space-y-2 overflow-auto text-[11px] font-mono pr-1 border border-base-300/40 rounded p-2 bg-base-300/20 flex-1"
          >
            {generateItems.map((r, i) => (
              <div
                key={i}
                className="p-2 rounded bg-base-300/40 border border-base-300/50"
              >
                <div className="text-base-content/60 mb-1 flex items-center gap-2">
                  <span className="badge badge-xs">{i + 1}</span>Partial {i + 1}
                </div>
                <pre className="whitespace-pre-wrap break-all leading-snug">{serializeWorkflow(r.workflowDefinition)}</pre>
              </div>
            ))}
            {fixItems.map((r, i) => (
              <div
                key={"fix-" + i}
                className="p-2 rounded bg-warning/20 border border-warning/40"
              >
                <div className="text-warning-content/70 mb-1 flex items-center gap-2">
                  <span className="badge badge-xs badge-warning">
                    {i + 1}
                  </span>Fix Partial {i + 1}
                </div>
                <pre className="whitespace-pre-wrap break-all leading-snug">{serializeWorkflow(r.fixedWorkflowDefinition)}</pre>
              </div>
            ))}
            {errorGenerate && <div className="text-error">{errorGenerate}</div>}
            {errorFix && <div className="text-error">{errorFix}</div>}
            {!generateItems.length && !isGenerating && !isFixing && (
              <div className="text-base-content/50">
                まだ生成は開始されていません。
              </div>
            )}
            {isGenerating && (
              <div className="text-primary animate-pulse">受信中...</div>
            )}
            {isFixing && (
              <div className="text-warning animate-pulse">修正中...</div>
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
      <div className="h-full flex items-center justify-center text-base-content/50 text-sm">
        コードはまだありません。
      </div>
    );
  }
  return (
    <div className="space-y-2 overflow-auto h-full pr-1">
      {codeLines.map((ln) => (
        <div
          key={ln.number}
          className="group border border-base-300/60 bg-base-300/10 hover:bg-base-300/20 transition-colors rounded px-2 py-1 flex items-start gap-3 font-mono"
        >
          <div className="w-10 text-right select-none text-xs text-base-content/50 pr-1">
            {ln.number}
          </div>
          <pre className="text-[11px] leading-snug whitespace-pre-wrap break-words flex-1">{ln.text || " "}</pre>
        </div>
      ))}
    </div>
  );
});

interface DiffViewProps {
  diffLines: DiffLine[];
}
const DiffView = memo(function DiffView({ diffLines }: DiffViewProps) {
  if (!diffLines.length) {
    return <div className="text-base-content/50">差分はありません。</div>;
  }
  return (
    <div className="h-full overflow-auto p-3 rounded bg-base-300/20 text-[11px] font-mono space-y-0.5">
      {diffLines.map((l, i) => (
        <div
          key={i}
          className={cn(
            "px-2 py-0.5 rounded leading-snug break-all",
            l.type === "added" && "bg-success/15 text-success-content",
            l.type === "removed" &&
              "bg-error/15 text-error-content line-through opacity-80",
            l.type === "same" && "text-base-content/70",
          )}
        >
          {l.type === "added" ? "+ " : l.type === "removed" ? "- " : "  "}
          {l.text || " "}
        </div>
      ))}
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
    <div className="flex flex-col h-full gap-3 min-h-0 px-0">
      <div className="flex flex-row gap-4 flex-1 min-h-0 overflow-hidden p-4">
        {/* Left Column with resizable split */}
        <div ref={colRef} className="flex flex-col w-full md:w-1/3 min-h-0">
          <div
            className="flex flex-col min-h-0 flex-1"
            style={{
              gridTemplateRows: `${Math.round(promptHeightRatio * 100)}% 4px ${
                Math.round((1 - promptHeightRatio) * 100)
              }%`,
            }}
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

            {/* Drag handle */}
            <div
              role="separator"
              aria-orientation="horizontal"
              onMouseDown={onDragStart}
              className="h-1 rounded bg-base-300/60 hover:bg-primary/60 transition cursor-row-resize mb-2"
              title="ドラッグしてサイズ変更"
              style={{ userSelect: "none" }}
            />

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

        {/* Right Column (unchanged wrapper but ensure min-h-0) */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="card bg-base-200/50 border border-base-300 shadow-sm flex-1 min-h-0 flex flex-col">
            <div className="card-body gap-4 p-4 flex flex-col min-h-0">
              <div className="flex items-center gap-2 border-b border-base-300/50 pb-2">
                {/* ...existing code... tabs ... */}
                <button
                  type="button"
                  onClick={() => setPreviewTab("steps")}
                  className={cn(
                    "tab tab-bordered tab-sm",
                    previewTab === "steps" && "tab-active font-medium",
                  )}
                >
                  ステップ ({wf.stepCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("json")}
                  className={cn(
                    "tab tab-bordered tab-sm",
                    previewTab === "json" && "tab-active font-medium",
                  )}
                >
                  整形JSON
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("raw")}
                  className={cn(
                    "tab tab-bordered tab-sm",
                    previewTab === "raw" && "tab-active font-medium",
                  )}
                >
                  RAW
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("diff")}
                  className={cn(
                    "tab tab-bordered tab-sm",
                    previewTab === "diff" && "tab-active font-medium",
                  )}
                >
                  Diff
                </button>
                <div className="flex-1" />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (wf.currentDefinition) {navigator.clipboard.writeText(
                          wf.currentDefinition,
                        );}
                    }}
                    disabled={!wf.currentDefinition}
                    className="btn btn-xs btn-ghost gap-1"
                  >
                    <Copy size={12} /> コピー
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("json")}
                    disabled={!wf.currentDefinition}
                    className="btn btn-xs btn-outline gap-1"
                  >
                    <FileJson size={12} /> JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("diff")}
                    disabled={wf.generateItems.length < 2}
                    className="btn btn-xs btn-outline gap-1"
                  >
                    <DiffIcon size={12} /> Diff
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscardOpen(true)}
                    disabled={!(wf.genDefinition || wf.fixDefinition)}
                    className="btn btn-xs btn-error btn-outline gap-1"
                    title="現在のワークフローを破棄"
                  >
                    <Trash2 size={12} /> 破棄
                  </button>
                </div>
              </div>

              {/* 以下、currentDefinition利用部分は既存コードを維持 */}
              <div className="relative flex-1 overflow-hidden min-h-0">
                {previewTab === "steps" && (
                  <StepsView codeLines={wf.codeLines} />
                )}
                {previewTab === "json" && (
                  <pre className="h-full overflow-auto p-3 rounded bg-base-300/20 text-xs font-mono whitespace-pre text-base-content/90">{wf.currentDefinition || "(空)"}</pre>
                )}
                {previewTab === "raw" && (
                  <pre className="h-full overflow-auto p-3 rounded bg-base-300/20 text-xs font-mono whitespace-pre-wrap break-all text-base-content/80">{wf.currentDefinition || "(空)"}</pre>
                )}
                {previewTab === "diff" && <DiffView diffLines={wf.diffLines} />}
                {!wf.currentDefinition && (wf.isGenerating || wf.isFixing) &&
                  previewTab !== "diff" && (
                  <div className="absolute inset-0 flex items-center justify-center text-base-content/50 text-sm">
                    構築中...
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-base-300/40 text-[11px] flex items-center gap-4 text-base-content/60">
                <span>
                  Partials: {wf.generateItems.length + wf.fixItems.length}
                </span>
                <span>Lines: {wf.stepCount}</span>
                {wf.isGenerating && (
                  <span className="text-primary animate-pulse">
                    Streaming...
                  </span>
                )}
                {wf.isFixing && (
                  <span className="text-warning animate-pulse">Fixing...</span>
                )}
                {wf.errorGenerate && (
                  <span className="text-error">Error: {wf.errorGenerate}</span>
                )}
                {wf.errorFix && (
                  <span className="text-error">Fix: {wf.errorFix}</span>
                )}
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
          現在の生成 /
          修正結果とプロンプト内容をすべて初期化します。<br />この操作は元に戻せません。実行してよろしいですか？
        </p>
      </Modal>
    </div>
  );
}
