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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGenerateWorkflowStream } from "@/lib/hooks/use-generate-workflow-stream.ts";
import { useFixWorkflowStream } from "@/lib/hooks/use-fix-workflow-stream.ts";
import { cn } from "@/lib/utils.ts";
import type { FixWorkflowRequest } from "@/gen/sapphillon/v1/workflow_service_pb.ts";
import { Modal } from "@/components";

// --- Helpers --------------------------------------------------------------
interface WorkflowStep {
  id: string;
  [k: string]: unknown;
}

function parseSteps(defText: string): WorkflowStep[] {
  try {
    if (!defText) return [];
    const parsed: unknown = JSON.parse(defText);
    if (typeof parsed === "object" && parsed && "steps" in parsed) {
      const stepsUnknown = (parsed as { steps?: unknown }).steps;
      if (Array.isArray(stepsUnknown)) {
        const filtered: WorkflowStep[] = [];
        for (const s of stepsUnknown) {
          if (
            typeof s === "object" && s !== null &&
            "id" in (s as Record<string, unknown>)
          ) {
            const rec = s as Record<string, unknown>;
            const idVal = rec.id;
            if (typeof idVal === "string") {
              filtered.push({ id: idVal, ...rec });
            }
          }
        }
        return filtered;
      }
    }
    return [];
  } catch {
    return [];
  }
}

interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
}
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
  return out.slice(0, 800); // safety cap
}

// --- Main Component -------------------------------------------------------
export function Generate() {
  const [prompt, setPrompt] = useState("");
  const {
    start,
    abort,
    reset: resetGenerate,
    isStreaming,
    currentDefinition: genDefinition,
    responses,
    error,
  } = useGenerateWorkflowStream();
  const {
    start: startFix,
    isStreaming: isFixing,
    currentDefinition: fixDefinition,
    responses: fixResponses,
    error: fixError,
    abort: abortFix,
    reset: resetFix,
  } = useFixWorkflowStream();
  const [previewTab, setPreviewTab] = useState<
    "steps" | "json" | "raw" | "diff"
  >("steps");
  const [autoScrollLog, setAutoScrollLog] = useState(true);
  const [expandedLog, setExpandedLog] = useState(true);
  const [leftRatio, setLeftRatio] = useState(0.55); // prompt area ratio in left column
  const [discardOpen, setDiscardOpen] = useState(false);
  const draggingRef = useRef(false);
  const colRef = useRef<HTMLDivElement | null>(null);

  // fixが存在すればそれを優先表示
  const currentDefinition = fixDefinition || genDefinition;

  const previousDefinition = responses.length > 1
    ? responses[responses.length - 2].workflowDefinition
    : "";
  const steps = useMemo(() => parseSteps(currentDefinition), [
    currentDefinition,
  ]);
  const stepCount = steps.length;
  const formattedJSON = useMemo(() => {
    try {
      return currentDefinition
        ? JSON.stringify(JSON.parse(currentDefinition), null, 2)
        : "";
    } catch {
      return currentDefinition;
    }
  }, [currentDefinition]);
  const diffLines = useMemo(
    () => buildSimpleDiff(previousDefinition, currentDefinition),
    [previousDefinition, currentDefinition],
  );
  const hasGenerated = !!genDefinition; // 初回生成済判定は生成フック基準

  const initiate = useCallback(() => {
    if (prompt.trim()) {
      if (!hasGenerated) {
        start(prompt);
      } else if (genDefinition) {
        const fixReq: FixWorkflowRequest = {
          workflowDefinition: genDefinition,
          description: prompt,
        } as FixWorkflowRequest;
        startFix(fixReq);
      }
    }
  }, [prompt, start, startFix, hasGenerated, genDefinition]);

  const resetWorkflow = useCallback(() => {
    if (isStreaming || isFixing) {
      abort();
      abortFix();
    }
    resetGenerate();
    resetFix();
    setPrompt("");
    setPreviewTab("steps");
    setLeftRatio(0.55);
  }, [abort, abortFix, isStreaming, isFixing, resetGenerate, resetFix]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        initiate();
      }
      if (e.key === "Escape" && (isStreaming || isFixing)) abort();
    };
    globalThis.addEventListener("keydown", h);
    return () => globalThis.removeEventListener("keydown", h);
  }, [initiate, abort, isStreaming, isFixing]);

  // Auto-scroll log
  const logRef = useCallback((el: HTMLDivElement | null) => {
    if (el && autoScrollLog) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [autoScrollLog, responses.length]);

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initiate();
  };

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
  }, []);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!draggingRef.current || !colRef.current) return;
      const rect = colRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const ratio = Math.min(0.85, Math.max(0.15, y / rect.height));
      setLeftRatio(ratio);
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

  return (
    <div className="flex flex-col h-full gap-3 min-h-0 px-0">
      <div className="flex flex-row gap-4 flex-1 min-h-0 overflow-hidden p-4">
        {/* Left Column with resizable split */}
        <div ref={colRef} className="flex flex-col w-full md:w-1/3 min-h-0">
          <div
            className="flex flex-col min-h-0 flex-1"
            style={{
              gridTemplateRows: `${Math.round(leftRatio * 100)}% 4px ${
                Math.round((1 - leftRatio) * 100)
              }%`,
            }}
          >
            {/* Prompt panel */}
            <form
              onSubmit={handleSubmit}
              className="card bg-base-200/50 border border-base-300 shadow-sm flex flex-col min-h-0 mb-2 overflow-hidden flex-1"
              style={{ height: `${leftRatio * 100}%` }}
            >
              <div className="card-body p-4 flex flex-col gap-3 min-h-0">
                <div className="flex items-center justify-between">
                  <h2 className="card-title text-sm flex items-center gap-2">
                    <Sparkles size={14} /> プロンプト
                  </h2>
                  <div className="flex gap-2 items-center text-xs">
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={autoScrollLog}
                        onChange={(e) => setAutoScrollLog(e.target.checked)}
                      />
                      <span>自動スクロール</span>
                    </label>
                  </div>
                </div>
                {/* Textarea fills */}
                <div className="relative flex-1 min-h-0">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例: 天気を確認して雨なら通知するワークフローを作成"
                    className="textarea textarea-bordered font-mono resize-none w-full h-full leading-relaxed text-sm"
                  />
                  {isStreaming && !prompt && (
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
                      type="button"
                      onClick={initiate}
                      disabled={!prompt.trim() || isStreaming || isFixing}
                      className="btn btn-sm btn-primary gap-1"
                    >
                      <Play size={14} /> {hasGenerated ? "修正" : "生成"}
                    </button>
                    {(isStreaming || isFixing) && (
                      <button
                        type="button"
                        onClick={() => {
                          isStreaming ? abort() : abortFix();
                        }}
                        className="btn btn-sm btn-outline gap-1"
                      >
                        <StopCircle size={14} /> 停止
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Drag handle */}
            <div
              role="separator"
              aria-orientation="horizontal"
              onMouseDown={onDragStart}
              className="h-1 rounded bg-base-300/60 hover:bg-primary/60 transition cursor-row-resize mb-2"
              title="ドラッグしてサイズ変更"
              style={{ userSelect: "none" }}
            />

            {/* Log panel */}
            <div
              className="card bg-base-200/50 border border-base-300 shadow-sm flex flex-col overflow-hidden flex-1"
              style={{ height: `${(1 - leftRatio) * 100}%` }}
            >
              <div className="card-body gap-3 p-4 flex flex-col min-h-0">
                <div className="flex items-center justify-between shrink-0">
                  <h2 className="card-title text-sm flex items-center gap-2">
                    <ListTree size={14} /> ストリームログ
                  </h2>
                  <button
                    type="button"
                    onClick={() => setExpandedLog(!expandedLog)}
                    className="btn btn-ghost btn-xs"
                  >
                    {expandedLog ? "折りたたむ" : "展開"}
                  </button>
                </div>
                {expandedLog && (
                  <div
                    ref={logRef}
                    className="space-y-2 overflow-auto text-[11px] font-mono pr-1 border border-base-300/40 rounded p-2 bg-base-300/20 flex-1"
                  >
                    {responses.map((r, i) => (
                      <div
                        key={i}
                        className="p-2 rounded bg-base-300/40 border border-base-300/50"
                      >
                        <div className="text-base-content/60 mb-1 flex items-center gap-2">
                          <span className="badge badge-xs">{i + 1}</span>Partial
                          {" "}
                          {i + 1}
                        </div>
                        <pre className="whitespace-pre-wrap break-all leading-snug">{r.workflowDefinition}</pre>
                      </div>
                    ))}
                    {error && <div className="text-error">{error}</div>}
                    {!responses.length && !isStreaming && (
                      <div className="text-base-content/50">
                        まだ生成は開始されていません。
                      </div>
                    )}
                    {isStreaming && (
                      <div className="text-primary animate-pulse">
                        受信中...
                      </div>
                    )}
                    {isFixing && (
                      <div className="text-warning animate-pulse">
                        修正中...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
                  ステップ ({stepCount})
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
                      if (currentDefinition) {
                        navigator.clipboard.writeText(
                          currentDefinition,
                        );
                      }
                    }}
                    disabled={!currentDefinition}
                    className="btn btn-xs btn-ghost gap-1"
                  >
                    <Copy size={12} /> コピー
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("json")}
                    disabled={!currentDefinition}
                    className="btn btn-xs btn-outline gap-1"
                  >
                    <FileJson size={12} /> JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("diff")}
                    disabled={responses.length < 2}
                    className="btn btn-xs btn-outline gap-1"
                  >
                    <DiffIcon size={12} /> Diff
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscardOpen(true)}
                    disabled={!(genDefinition || fixDefinition)}
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
                  <div className="space-y-2 overflow-auto h-full pr-1">
                    {steps.length
                      ? steps.map((s, i) => (
                        <div
                          key={s.id + i}
                          className="group border border-base-300/60 bg-base-300/20 hover:bg-base-300/30 transition-colors rounded-md p-3 flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <span>{s.id}</span>
                              {i === steps.length - 1 &&
                                (isStreaming || isFixing) && (
                                <span className="badge badge-xs badge-outline">
                                  updating...
                                </span>
                              )}
                            </div>
                            <pre className="text-[11px] mt-1 text-base-content/70 whitespace-pre-wrap break-words leading-tight">{JSON.stringify(s, null, 2)}</pre>
                          </div>
                        </div>
                      ))
                      : (
                        <div className="h-full flex items-center justify-center text-base-content/50 text-sm">
                          ステップはまだありません。
                        </div>
                      )}
                  </div>
                )}
                {previewTab === "json" && (
                  <pre className="h-full overflow-auto p-3 rounded bg-base-300/20 text-xs font-mono whitespace-pre text-base-content/90">{formattedJSON || "(空)"}</pre>
                )}
                {previewTab === "raw" && (
                  <pre className="h-full overflow-auto p-3 rounded bg-base-300/20 text-xs font-mono whitespace-pre-wrap break-all text-base-content/80">{currentDefinition || "(空)"}</pre>
                )}
                {previewTab === "diff" && (
                  <div className="h-full overflow-auto p-3 rounded bg-base-300/20 text-[11px] font-mono space-y-0.5">
                    {diffLines.length
                      ? diffLines.map((l, i) => (
                        <div
                          key={i}
                          className={cn(
                            "px-2 py-0.5 rounded leading-snug break-all",
                            l.type === "added" &&
                              "bg-success/15 text-success-content",
                            l.type === "removed" &&
                              "bg-error/15 text-error-content line-through opacity-80",
                            l.type === "same" && "text-base-content/70",
                          )}
                        >
                          {l.type === "added"
                            ? "+ "
                            : l.type === "removed"
                            ? "- "
                            : "  "}
                          {l.text || " "}
                        </div>
                      ))
                      : (
                        <div className="text-base-content/50">
                          差分はありません。
                        </div>
                      )}
                  </div>
                )}
                {!currentDefinition && (isStreaming || isFixing) &&
                  previewTab !== "diff" && (
                  <div className="absolute inset-0 flex items-center justify-center text-base-content/50 text-sm">
                    構築中...
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-base-300/40 text-[11px] flex items-center gap-4 text-base-content/60">
                <span>Partials: {responses.length + fixResponses.length}</span>
                <span>Steps: {stepCount}</span>
                {isStreaming && (
                  <span className="text-primary animate-pulse">
                    Streaming...
                  </span>
                )}
                {isFixing && (
                  <span className="text-warning animate-pulse">
                    Fixing...
                  </span>
                )}
                {error && <span className="text-error">Error: {error}</span>}
                {fixError && <span className="text-error">Fix: {fixError}
                </span>}
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
                resetWorkflow();
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
