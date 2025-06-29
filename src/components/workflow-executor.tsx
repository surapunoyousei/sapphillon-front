import { useState } from "react";
import { Card } from "@/components/common/card.tsx";
import { Button } from "@/components/common/button.tsx";
import { APIClient } from "@/lib/requests.ts";
import { AlertCircle, CheckCircle, Play, Square } from "lucide-react";

interface WorkflowExecutorProps {
  goal: string;
  setGoal: (goal: string) => void;
  isConnected: boolean;
}

export function WorkflowExecutor(
  { goal, setGoal, isConnected }: WorkflowExecutorProps,
) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeWorkflow = async () => {
    if (!goal.trim()) return;

    setIsExecuting(true);
    setResult(null);
    setError(null);

    try {
      console.log("ワークフロー実行開始:", goal);
      const response = await APIClient.main.executeWorkflow(goal);

      console.log("ワークフロー実行レスポンス:", response);

      if (response.status === "success") {
        setResult(response.output || "ワークフローが正常に実行されました");
        console.log("ワークフロー実行成功");
      } else {
        setError(response.error || "ワークフローの実行に失敗しました");
        console.error("ワークフロー実行失敗:", response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "予期しないエラーが発生しました";
      setError(errorMessage);
      console.error("ワークフロー実行エラー:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setError("ユーザーによって実行が停止されました");
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setGoal("");
  };

  const canExecute = goal.trim().length > 0;

  return (
    <div className="space-y-4">
      {goal && (
        <Card className="bg-black/10 backdrop-blur-sm border-white/5">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                実行中のワークフロー
              </h3>
              <div className="flex gap-2">
                {!isExecuting
                  ? (
                    <Button
                      onClick={executeWorkflow}
                      disabled={!canExecute}
                      className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      実行
                    </Button>
                  )
                  : (
                    <Button
                      onClick={stopExecution}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      停止
                    </Button>
                  )}
                <Button
                  onClick={clearResults}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  クリア
                </Button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-slate-300 text-sm font-mono">{goal}</p>
            </div>

            {!isConnected && (
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    一部のサーバーに接続できていません。ワークフローの機能が制限される可能性があります。
                  </span>
                </div>
              </div>
            )}

            {isExecuting && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400">
                </div>
                <span>ワークフローを実行中...</span>
              </div>
            )}

            {result && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">実行完了</span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <pre className="text-slate-300 text-sm whitespace-pre-wrap overflow-auto max-h-96">
                    {result}
                  </pre>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">エラー</span>
                </div>
                <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
