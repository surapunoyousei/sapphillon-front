import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Diff as DiffIcon,
  FileJson,
  ListTree,
  Trash2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils.ts";
import { QK } from "@/lib/query-keys.ts";
import { useWorkflowStreams } from "@/components/workflow/generate/use-workflow-streams.ts";
import { PromptPanel } from "@/components/workflow/generate/prompt-panel.tsx";
import { StreamLog } from "@/components/workflow/generate/stream-log.tsx";
import { StepsView } from "@/components/workflow/generate/steps-view.tsx";
import { DiffView } from "@/components/workflow/generate/diff-view.tsx";
import { DiscardWorkflowModal } from "@/components/workflow/generate/discard-workflow-modal.tsx";
import { TestWorkflowModal } from "@/components/workflow/generate/test-workflow-modal.tsx";

// ============================================================================
// Types & Utility Functions
// ============================================================================

// ============================================================================
// Main Component
// ============================================================================

// --- Main Component -------------------------------------------------------
export function Generate() {
  const wf = useWorkflowStreams();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (wf.currentDefinition) {
      queryClient.setQueryData(QK.workflow.latest(), wf.currentDefinition);
    }
  }, [wf.currentDefinition, queryClient]);

  // UI local state
  const [previewTab, setPreviewTab] = useState<
    "steps" | "json" | "raw" | "diff"
  >("steps");
  const [autoScrollLog, setAutoScrollLog] = useState(true);
  const [expandedLog, setExpandedLog] = useState(true);
  const [promptHeightRatio, setPromptHeightRatio] = useState(0.55);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  // テスト実行ロジックは TestWorkflowModal 内に隔離

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
                  <button
                    type="button"
                    onClick={() => setTestOpen(true)}
                    disabled={!wf.currentDefinition || wf.isGenerating ||
                      wf.isFixing}
                    className="btn btn-xs btn-accent btn-outline gap-1"
                    title="ワークフローをテスト実行"
                  >
                    <Zap size={12} />
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
      <DiscardWorkflowModal
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onDiscard={() => wf.resetAll()}
      />
      <TestWorkflowModal
        open={testOpen}
        onClose={() => setTestOpen(false)}
        workflowDefinition={wf.currentDefinition}
      />
    </div>
  );
}
