import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal.tsx";
import { cn } from "@/lib/utils.ts";
import type {
  RunWorkflowRequest,
  RunWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb.ts";
import { workflowClient } from "@/lib/grpc-clients.ts";
import { TestResultView } from "./test-result-view.tsx";

interface Props {
  open: boolean;
  onClose: () => void;
  workflowDefinition: string | null;
}

export function TestWorkflowModal(
  { open, onClose, workflowDefinition }: Props,
) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<RunWorkflowResponse | null>(
    null,
  );
  const [testError, setTestError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    if (!workflowDefinition) return;
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(workflowDefinition);
      } catch (e) {
        throw new Error(
          "ワークフロー定義(JSON)のパースに失敗しました: " +
            (e as Error).message,
        );
      }
      const req = {
        workflowDefinition: parsed as RunWorkflowRequest["workflowDefinition"],
      } as RunWorkflowRequest;
      const res = await workflowClient.runWorkflow(req);
      setTestResult(res);
      if (res.status && (res.status.code ?? 0) !== 0) {
        setTestError(res.status.message || "テスト実行でエラーが発生しました");
      }
    } catch (e) {
      setTestError((e as Error).message);
    } finally {
      setIsTesting(false);
    }
  }, [workflowDefinition]);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isTesting) onClose();
      }}
      title="ワークフローテスト実行"
      size="lg"
      actions={
        <>
          <button
            type="button"
            className={cn("btn", isTesting ? "btn-disabled" : "btn-accent")}
            disabled={isTesting}
            onClick={runTest}
            data-autofocus
          >
            {isTesting && (
              <span className="loading loading-spinner loading-xs" />
            )}
            {isTesting ? "実行中..." : "テスト実行"}
          </button>
        </>
      }
    >
      {!workflowDefinition && (
        <div className="alert alert-warning text-sm">
          <AlertCircle size={14} />{" "}
          現在テスト可能なワークフロー定義がありません。
        </div>
      )}
      {workflowDefinition && (
        <div className="space-y-4">
          <div className="text-xs text-base-content/70 leading-relaxed">
            現在編集中のワークフローを試験的に実行し結果を確認します。思わぬ副作用が発生する可能性があります。
          </div>
          <div className="p-3 rounded border border-base-300/40 bg-base-300/10 max-h-40 overflow-auto text-[10px] font-mono whitespace-pre">
            {workflowDefinition}
          </div>
          <div className="border-t border-base-300/40 pt-3 space-y-3">
            {isTesting && (
              <div className="flex items-center gap-2 text-accent">
                <span className="loading loading-spinner loading-sm" />
                <span className="text-sm font-medium">テスト実行中...</span>
              </div>
            )}
            {testError && (
              <div className="alert alert-error text-xs">
                <AlertCircle size={12} /> {testError}
              </div>
            )}
            {testResult && !testError && <TestResultView result={testResult} />}
          </div>
        </div>
      )}
    </Modal>
  );
}
