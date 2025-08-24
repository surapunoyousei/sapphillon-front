import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { WorkflowResultType } from "@/gen/sapphillon/v1/workflow_pb.ts";
import { cn } from "@/lib/utils.ts";
import type { RunWorkflowResponse } from "@/gen/sapphillon/v1/workflow_service_pb.ts";

interface Props {
  result: RunWorkflowResponse;
  error?: string | null;
}

export function TestResultView({ result, error }: Props) {
  if (error) {
    return (
      <div className="alert alert-error text-xs">
        <AlertCircle size={12} /> {error}
      </div>
    );
  }
  const wr = result.workflowResult;
  if (!wr) return null;
  const status = result.status;
  const isFailure = wr?.resultType === WorkflowResultType.FAILURE;
  const resultTypeLabel = wr?.resultType === WorkflowResultType.FAILURE
    ? "FAILURE"
    : wr?.resultType === WorkflowResultType.SUCCESS_UNSPECIFIED
    ? "SUCCESS"
    : "(unknown)";
  const ranAtSeconds = (() => {
    if (!wr?.ranAt) return null;
    const r: unknown = wr.ranAt;
    if (r && typeof r === "object" && "seconds" in r) {
      const val = (r as { seconds?: string | number }).seconds;
      if (typeof val === "string" || typeof val === "number") {
        const num = Number(val);
        if (!Number.isNaN(num)) return num;
      }
    }
    return null;
  })();
  const ranAt = ranAtSeconds !== null
    ? new Date(ranAtSeconds * 1000).toLocaleString()
    : "-";
  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          isFailure ? "text-error" : "text-success",
        )}
      >
        {isFailure
          ? <AlertCircle size={14} />
          : <CheckCircle2 size={14} />}実行{isFailure ? "失敗" : "完了"}
        <span
          className={cn(
            "badge badge-xs",
            isFailure ? "badge-error" : "badge-success",
          )}
        >
          {resultTypeLabel}
        </span>
        {typeof wr?.exitCode === "number" && (
          <span className="text-xs opacity-70">exit: {wr.exitCode}</span>
        )}
      </div>
      {status && (status.code ?? 0) !== 0 && (
        <div className="alert alert-error text-xs">
          <AlertCircle size={12} /> Status Error:{" "}
          {status.message || status.code}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="space-y-1">
          <div className="text-base-content/50 uppercase tracking-wide text-[10px]">
            Result ID
          </div>
          <div className="font-mono break-all text-base-content/80">
            {wr?.id || "-"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-base-content/50 uppercase tracking-wide text-[10px]">
            Ran At
          </div>
          <div className="font-mono text-base-content/80">{ranAt}</div>
        </div>
        <div className="space-y-1 col-span-2">
          <div className="text-base-content/50 uppercase tracking-wide text-[10px]">
            Display Name
          </div>
          <div className="font-mono text-base-content/80 break-all">
            {wr?.displayName || "-"}
          </div>
        </div>
        <div className="space-y-1 col-span-2">
          <div className="text-base-content/50 uppercase tracking-wide text-[10px]">
            Description
          </div>
          <div className="text-base-content/80 whitespace-pre-wrap break-words text-[11px]">
            {wr?.description || "-"}
          </div>
        </div>
        <div className="space-y-1 col-span-2">
          <div className="text-base-content/50 uppercase tracking-wide text-[10px] flex items-center justify-between">
            <span>Raw Result</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(wr?.result || "");
                } catch { /* ignore */ }
              }}
            >
              <Copy size={10} />
            </button>
          </div>
          <div
            className={cn(
              "p-3 rounded border font-mono max-h-40 overflow-auto whitespace-pre-wrap break-words",
              isFailure
                ? "border-error/30 bg-error/10"
                : "border-success/30 bg-success/10",
            )}
          >
            {wr?.result || "(empty)"}
          </div>
        </div>
      </div>
      <details className="text-[11px]">
        <summary className="cursor-pointer mb-1 opacity-70 hover:opacity-100 transition">
          レスポンス全体(JSON)
        </summary>
        <div className="p-2 rounded border border-base-300/40 bg-base-300/10 font-mono max-h-48 overflow-auto whitespace-pre-wrap break-all">
          {(() => {
            try {
              return JSON.stringify(result, null, 2);
            } catch {
              return String(result);
            }
          })()}
        </div>
      </details>
    </div>
  );
}
