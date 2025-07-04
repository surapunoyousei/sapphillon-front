import { useEffect, useState } from "react";
import { MainAPI } from "@/lib/requests.ts";
import type { WorkflowResponse } from "@/types/requests.ts";

export function WorkflowInterface() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<WorkflowResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [currentGoal, setCurrentGoal] = useState<string>("");

  // カスタムイベントをリッスンして、ヘッダーからのワークフロー実行を受け取る
  useEffect(() => {
    const handleExecuteWorkflow = async (event: Event) => {
      const customEvent = event as CustomEvent<{ goal: string }>;
      const { goal } = customEvent.detail;
      await executeWorkflow(goal);
    };

    globalThis.addEventListener("executeWorkflow", handleExecuteWorkflow);
    return () => {
      globalThis.removeEventListener("executeWorkflow", handleExecuteWorkflow);
    };
  }, []);

  const executeWorkflow = async (goal: string) => {
    setIsExecuting(true);
    setError(null);
    setCurrentGoal(goal);

    try {
      const result = await MainAPI.executeWorkflow(goal);
      setWorkflowResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ワークフローの実行中にエラーが発生しました",
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 実行状態の表示 */}
      {isExecuting && (
        <div className="alert alert-info mb-6">
          <span className="loading loading-spinner"></span>
          <span>ワークフローを生成し、実行中... 「{currentGoal}」</span>
        </div>
      )}

      {/* エラーの表示 */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 実行結果の表示 */}
      {workflowResult && !isExecuting && (
        <div className="space-y-6">
          {/* ステータス情報 */}
          <div className="bg-base-200 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">実行結果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">プロンプト</p>
                <p className="font-medium">{currentGoal}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">ステータス</p>
                <p className="font-medium">
                  {workflowResult.status === "success"
                    ? <span className="text-success">成功</span>
                    : <span className="text-error">失敗</span>}
                </p>
              </div>
            </div>
          </div>

          {/* 生成されたワークフロー */}
          {workflowResult.workflow && (
            <div className="bg-base-200 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                生成されたワークフロー
              </h2>
              <div className="bg-base-300 rounded p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {workflowResult.workflow}
                </pre>
              </div>
            </div>
          )}

          {/* 実行ログ */}
          {workflowResult.output && (
            <div className="bg-base-200 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">実行ログ</h2>
              <div className="bg-base-300 rounded p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {workflowResult.output}
                </pre>
              </div>
            </div>
          )}

          {/* エラー情報 */}
          {(workflowResult.error || workflowResult.llm_response) && (
            <div className="bg-error/10 rounded-lg p-6 shadow-lg border border-error/20">
              <h2 className="text-xl font-semibold mb-4 text-error">
                エラー情報
              </h2>
              {workflowResult.error && (
                <p className="text-error mb-4">{workflowResult.error}</p>
              )}
              {workflowResult.llm_response && (
                <div className="mt-4">
                  <p className="text-sm text-base-content/70 mb-2">
                    LLMレスポンス
                  </p>
                  <p className="text-error/80">{workflowResult.llm_response}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 初期状態 */}
      {!workflowResult && !isExecuting && !error && (
        <div className="bg-base-200 rounded-lg p-12 shadow-lg text-center">
          <p className="text-lg text-base-content/70 mb-4">
            上部のプロンプト入力欄に目標を入力して、Enterキーを押してください
          </p>
          <p className="text-sm text-base-content/50">
            例：「家計簿ファイルをドキュメントフォルダから探してメール送信」
          </p>
        </div>
      )}
    </div>
  );
}
