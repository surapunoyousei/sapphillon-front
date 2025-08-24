import { AlertCircle, CheckCircle2, ListTree, Zap } from "lucide-react";
import { memo, useCallback } from "react";
import { cn } from "@/lib/utils.ts";
import type { StreamLogProps } from "./types.ts";

export const StreamLog = memo(function StreamLog(props: StreamLogProps) {
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
  const refSetter = useCallback((el: HTMLDivElement | null) => {
    if (el && autoScrollLog) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [autoScrollLog, generateItems.length, fixItems.length]);
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
                <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
                {" "}
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
                  <div className="loading loading-spinner loading-sm text-primary" />
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
