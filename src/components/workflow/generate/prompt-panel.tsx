import { Wand2, Zap } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils.ts";
import type { PromptPanelProps } from "./types.ts";

export const PromptPanel = memo(function PromptPanel(props: PromptPanelProps) {
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
        </div>
        <div className="flex justify-between items-center text-xs pt-2 border-t border-base-300/30 flex-shrink-0">
          <div className="flex items-center gap-3 text-base-content/60">
            <span className="flex items-center gap-1">
              <kbd className="kbd kbd-xs">
                Ctrl
              </kbd>+<kbd className="kbd kbd-xs">Enter</kbd> で生成
            </span>
            <span className="text-base-content/40">|</span>
            <span className="flex items-center gap-1">
              <kbd className="kbd kbd-xs">
                Shift
              </kbd>+<kbd className="kbd kbd-xs">Enter</kbd> で改行
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
                (hasGenerated ? <Zap size={14} /> : <Wand2 size={14} />)}
              {hasGenerated ? "修正" : "生成"}
            </button>
            {isProcessing && (
              <button
                type="button"
                onClick={abortAll}
                className="btn btn-sm btn-outline btn-error gap-2 hover:btn-error/80"
              >
                <Zap size={14} /> 停止
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
});
