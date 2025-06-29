import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/common/sidebar.tsx";

interface ProgressStep {
  id: string;
  label: string;
  status: "waiting" | "active" | "completed" | "error";
}

export function AppSidebar() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<string>("");
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: "llm", label: "LLMに接続", status: "waiting" },
    { id: "plugins", label: "プラグインを確認中", status: "waiting" },
    { id: "userdata", label: "ユーザーデータを処理中", status: "waiting" },
    { id: "workflow", label: "ワークフローを生成中", status: "waiting" },
    { id: "confirm", label: "ワークフローを確認中", status: "waiting" },
    { id: "user_confirm", label: "ユーザーの確認待ち", status: "waiting" },
    { id: "pre_execute", label: "実行前の処理中", status: "waiting" },
    { id: "executing", label: "実行中", status: "waiting" },
  ]);

  // ワークフロー実行イベントをリッスン
  useEffect(() => {
    const handleExecuteWorkflow = (event: Event) => {
      const customEvent = event as CustomEvent<{ goal: string }>;
      const { goal } = customEvent.detail;
      setCurrentGoal(goal);
      setIsExecuting(true);
      simulateProgress();
    };

    const handleWorkflowComplete = () => {
      setIsExecuting(false);
      // すべてのステップを完了状態に設定
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({ ...step, status: "completed" as const }))
      );
    };

    globalThis.addEventListener("executeWorkflow", handleExecuteWorkflow);
    globalThis.addEventListener("workflowComplete", handleWorkflowComplete);

    return () => {
      globalThis.removeEventListener("executeWorkflow", handleExecuteWorkflow);
      globalThis.removeEventListener(
        "workflowComplete",
        handleWorkflowComplete,
      );
    };
  }, []);

  const simulateProgress = () => {
    const stepIds = [
      "llm",
      "plugins",
      "userdata",
      "workflow",
      "confirm",
      "user_confirm",
      "pre_execute",
      "executing",
    ];

    stepIds.forEach((stepId, index) => {
      setTimeout(() => {
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === stepId
              ? { ...step, status: "active" as const }
              : step.status === "active"
              ? { ...step, status: "completed" as const }
              : step
          )
        );

        // 最後のステップの場合、完了後にイベントを発行
        if (index === stepIds.length - 1) {
          setTimeout(() => {
            setSteps((prevSteps) =>
              prevSteps.map((step) =>
                step.id === stepId
                  ? { ...step, status: "completed" as const }
                  : step
              )
            );
            const completeEvent = new CustomEvent("workflowComplete");
            globalThis.dispatchEvent(completeEvent);
          }, 10000);
        }
      }, index * 10000);
    });
  };

  const handleStop = () => {
    // 停止処理
    setIsExecuting(false);
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({ ...step, status: "waiting" as const }))
    );
    console.log("ワークフローを停止しました");
  };

  const handleCancel = () => {
    // 中止処理
    setIsExecuting(false);
    setCurrentGoal("");
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({ ...step, status: "waiting" as const }))
    );
    console.log("ワークフローを中止しました");
  };

  const getStepIcon = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return "✓";
      case "active":
        return "●";
      case "error":
        return "✗";
      default:
        return "●";
    }
  };

  const getStepColor = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "active":
        return "text-primary";
      case "error":
        return "text-error";
      default:
        return "text-base-content/30";
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold">実行状況と進捗</h2>
      </SidebarHeader>

      <SidebarContent>
        {/* 現在のプロンプト */}
        {currentGoal && (
          <div className="px-4 py-3 mb-4 bg-base-300 rounded-lg">
            <p className="text-xs text-base-content/70 mb-1">
              現在のプロンプト
            </p>
            <p className="text-sm font-medium">{currentGoal}</p>
          </div>
        )}

        {/* 進捗ステップ */}
        <div className="space-y-1">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3 px-2 py-2">
              {/* 接続線 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full flex items-center justify-center text-xs ${
                    getStepColor(step.status)
                  }`}
                >
                  {getStepIcon(step.status)}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-6 ${
                      step.status === "completed"
                        ? "bg-success"
                        : "bg-base-content/20"
                    }`}
                  >
                  </div>
                )}
              </div>

              {/* ステップ名 */}
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    step.status === "active" ? "font-medium" : ""
                  } ${getStepColor(step.status)}`}
                >
                  {step.label}
                </p>
                {step.status === "active" && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="loading loading-dots loading-xs"></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter>
        {isExecuting
          ? (
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm flex-1"
                onClick={handleStop}
              >
                停止
              </button>
              <button
                className="btn btn-secondary btn-sm flex-1"
                onClick={handleCancel}
              >
                中止
              </button>
            </div>
          )
          : (
            <div className="text-center py-4">
              <p className="text-sm text-base-content/50">
                {currentGoal ? "ワークフロー完了" : "実行待機中"}
              </p>
            </div>
          )}
      </SidebarFooter>
    </Sidebar>
  );
}
