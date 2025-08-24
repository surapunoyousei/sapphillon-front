import { Copy, FileJson } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils.ts";
import type { StepsViewProps } from "./types.ts";

export const StepsView = memo(
  function StepsView({ codeLines }: StepsViewProps) {
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
                      index === codeLines.length - 1 && index > 0 &&
                        "bg-info/20 text-info border-2 border-info/30",
                      index > 0 && index < codeLines.length - 1 &&
                        "bg-base-300/60 text-base-content/60 border-2 border-base-300/40",
                    )}
                  >
                    {ln.number}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <pre className="text-xs leading-relaxed whitespace-pre-wrap break-words text-base-content/90 overflow-auto max-h-32">{ln.text || (<span className="text-base-content/30 italic">空行</span>)}</pre>
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
  },
);
