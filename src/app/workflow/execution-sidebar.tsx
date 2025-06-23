import {
  Brain,
  CheckCircle,
  Circle,
  Cog,
  Loader2,
  Play,
  Plug,
  Shield,
  User,
} from "lucide-react";

interface ExecutionStep {
  id: number;
  label: string;
  icon?: React.ReactNode;
}

interface ExecutionSidebarProps {
  currentStep: number;
  status: "completed" | "running" | "pending";
}

export function ExecutionSidebar(
  { currentStep, status }: ExecutionSidebarProps,
) {
  console.log(currentStep, status);

  const steps: ExecutionStep[] = [
    {
      id: 1,
      label: "LLMに接続",
      icon: <Brain className="w-4 h-4" />,
    },
    {
      id: 2,
      label: "プラグインを確認中",
      icon: <Plug className="w-4 h-4" />,
    },
    {
      id: 3,
      label: "ユーザーデータを処理中",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 4,
      label: "ワークフローを生成中",
      icon: <Cog className="w-4 h-4" />,
    },
    {
      id: 5,
      label: "ワークフローを確認中",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 6,
      label: "ユーザーの確認待ち",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 7,
      label: "実行前の処理中",
      icon: <Cog className="w-4 h-4" />,
    },
    {
      id: 8,
      label: "実行中",
      icon: <Play className="w-4 h-4" />,
    },
  ];

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep && status === "running") return "running";
    return "pending";
  };

  return (
    <div className="w-80 border-l border-base-300 bg-base-200 p-6 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">実行状況と進捗</h2>
        <p className="text-sm text-base-content/60">
          ワークフローの実行状況
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);

          return (
            <div key={step.id} className="relative flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {status === "completed" && (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
                {status === "running" && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                {status === "pending" && (
                  <Circle className="w-5 h-5 text-base-content/30" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {step.icon && (
                    <span
                      className={`${
                        status === "completed"
                          ? "text-base-content"
                          : status === "running"
                          ? "text-primary"
                          : "text-base-content/50"
                      }`}
                    >
                      {step.icon}
                    </span>
                  )}
                  <p
                    className={`text-sm ${
                      status === "completed"
                        ? "text-base-content"
                        : status === "running"
                        ? "text-primary font-medium"
                        : "text-base-content/50"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className="absolute left-2.5 top-7 w-0.5 h-8 bg-base-content/20"
                  style={{ height: "2rem" }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="divider flex" />

      <div className="p-4 bg-base-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-success" />
          <span className="text-sm font-medium">セキュリティ</span>
        </div>
        <p className="text-xs text-base-content/60">
          すべての処理はローカル環境で実行されています。
          データは外部に送信されません。
        </p>
      </div>
    </div>
  );
}
