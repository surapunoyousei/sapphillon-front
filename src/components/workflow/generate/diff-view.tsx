import { Copy, Diff as DiffIcon } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils.ts";
import type { DiffViewProps } from "./types.ts";

export const DiffView = memo(function DiffView({ diffLines }: DiffViewProps) {
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
            <div className="w-3 h-3 rounded bg-success/80" />
            <span className="text-success font-medium">+{addedCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-error/80" />
            <span className="text-error font-medium">-{removedCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-base-400/60" />
            <span className="text-base-content/60">{unchangedCount}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const diffText = diffLines.map((l) =>
              `${
                l.type === "added" ? "+" : l.type === "removed" ? "-" : " "
              } ${l.text}`
            ).join("\n");
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
