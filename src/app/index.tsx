import { useState } from "react";
import {
  AlertCircle,
  Brain,
  CheckCircle,
  Clock,
  Cpu,
  MoreHorizontal,
  Play,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "../components/common/button.tsx";
import { Input } from "../components/common/input.tsx";
import { Card } from "../components/common/card.tsx";

interface WorkflowExecution {
  id: string;
  prompt: string;
  status: "running" | "completed" | "error" | "pending";
  progress: number;
  startTime: Date;
  endTime?: Date;
  steps: Array<{
    id: string;
    name: string;
    status: "completed" | "active" | "pending" | "error";
    description: string;
  }>;
}

export function Home() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([
    {
      id: "1",
      prompt: "Floorp ブラウザについてまとめてください。",
      status: "running",
      progress: 60,
      startTime: new Date(Date.now() - 30000),
      steps: [
        {
          id: "1",
          name: "LLMに接続",
          status: "completed",
          description: "ローカルLLMモデルに接続しました",
        },
        {
          id: "2",
          name: "プラグインを確認中",
          status: "active",
          description: "利用可能なプラグインを確認しています",
        },
        {
          id: "3",
          name: "ユーザーデータを処理中",
          status: "pending",
          description: "ユーザーデータを安全に処理します",
        },
        {
          id: "4",
          name: "ワークフローを生成中",
          status: "pending",
          description: "最適なワークフローを生成します",
        },
        {
          id: "5",
          name: "ワークフローを確認中",
          status: "pending",
          description: "生成されたワークフローを確認します",
        },
        {
          id: "6",
          name: "ユーザーの確認待ち",
          status: "pending",
          description: "実行前にユーザーの確認を求めます",
        },
        {
          id: "7",
          name: "実行中",
          status: "pending",
          description: "ワークフローを実行します",
        },
      ],
    },
    {
      id: "2",
      prompt: "デスクトップの画像ファイルを整理してください",
      status: "completed",
      progress: 100,
      startTime: new Date(Date.now() - 300000),
      endTime: new Date(Date.now() - 60000),
      steps: [
        {
          id: "1",
          name: "LLMに接続",
          status: "completed",
          description: "ローカルLLMモデルに接続しました",
        },
        {
          id: "2",
          name: "ファイルシステムにアクセス",
          status: "completed",
          description: "デスクトップフォルダにアクセスしました",
        },
        {
          id: "3",
          name: "画像ファイルを検索",
          status: "completed",
          description: "15個の画像ファイルを発見しました",
        },
        {
          id: "4",
          name: "フォルダを作成",
          status: "completed",
          description: "「整理済み画像」フォルダを作成しました",
        },
        {
          id: "5",
          name: "ファイルを移動",
          status: "completed",
          description: "すべての画像ファイルを移動しました",
        },
      ],
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);

    // Simulate workflow creation and execution
    const newExecution: WorkflowExecution = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      status: "pending",
      progress: 0,
      startTime: new Date(),
      steps: [
        {
          id: "1",
          name: "LLMに接続",
          status: "pending",
          description: "ローカルLLMモデルに接続中...",
        },
        {
          id: "2",
          name: "プロンプトを解析",
          status: "pending",
          description: "ユーザーの指示を解析します",
        },
        {
          id: "3",
          name: "ワークフローを生成",
          status: "pending",
          description: "最適なワークフローを生成します",
        },
        {
          id: "4",
          name: "実行準備",
          status: "pending",
          description: "実行環境を準備します",
        },
      ],
    };

    setExecutions((prev) => [newExecution, ...prev]);
    setPrompt("");

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setExecutions((prev) =>
        prev.map((exec) =>
          exec.id === newExecution.id
            ? { ...exec, status: "running" as const, progress: 25 }
            : exec
        )
      );
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "running":
      case "active":
        return <Play className="w-4 h-4 text-primary" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-error" />;
      default:
        return <Clock className="w-4 h-4 text-base-content/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "running":
      case "active":
        return "text-primary";
      case "error":
        return "text-error";
      default:
        return "text-base-content/50";
    }
  };

  return (
    <div className="min-h-screen bg-base-100 relative">
      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-base-content mb-4 leading-tight">
              こんにちは、
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mx-3">
                User
              </span>
              さん
            </h1>
            <p className="text-xl text-base-content/70 font-medium">
              Floorp OS で何をお手伝いしましょうか？自然言語で指示してください。
            </p>
          </div>

          {/* Enhanced Prompt Input */}
          <Card className="p-8 bg-gradient-to-br from-base-100/80 via-base-100 to-base-200/50 backdrop-blur-sm border-2 border-primary/10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="relative flex items-center">
                  <div className="absolute left-5 z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-content" />
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="例: 「デスクトップのファイルを整理してください」「今日のニュースを要約してください」"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="pl-20 pr-20 h-16 text-lg bg-base-100/90 border-2 border-primary/20 focus:border-primary/40 rounded-2xl shadow-lg backdrop-blur-sm"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Enhanced Tips */}
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
                  <Zap className="w-4 h-4" />
                  <span>ファイル整理</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-secondary/10 rounded-full text-sm text-secondary">
                  <Brain className="w-4 h-4" />
                  <span>ニュース要約</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-accent/10 rounded-full text-sm text-accent">
                  <Cpu className="w-4 h-4" />
                  <span>システム設定</span>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Execution Status */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-base-content mb-2">
                実行状況と進捗
              </h2>
              <p className="text-base-content/70">
                リアルタイムでワークフローの状況を確認できます
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse">
                </div>
                <span className="font-medium text-primary">実行中</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="font-medium text-success">完了</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-error rounded-full"></div>
                <span className="font-medium text-error">エラー</span>
              </div>
            </div>
          </div>

          {executions.length === 0
            ? (
              <Card className="p-12 text-center bg-gradient-to-br from-base-100 to-base-200/30 border-2 border-base-300/30">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-primary/60" />
                </div>
                <h3 className="text-xl font-semibold text-base-content mb-2">
                  まだ実行されたワークフローはありません
                </h3>
                <p className="text-base-content/60">
                  上記のプロンプト入力から始めてください
                </p>
              </Card>
            )
            : (
              <div className="space-y-6">
                {executions.map((execution) => (
                  <Card
                    key={execution.id}
                    className="p-8 bg-gradient-to-br from-base-100/90 to-base-200/30 border-2 border-base-300/20 shadow-xl backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                            {getStatusIcon(execution.status)}
                          </div>
                          <h3 className="text-xl font-semibold text-base-content flex-1">
                            {execution.prompt}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-base-content/70">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              開始: {execution.startTime.toLocaleTimeString()}
                            </span>
                          </div>
                          {execution.endTime && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>
                                終了: {execution.endTime.toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              getStatusColor(execution.status)
                            } bg-current/10`}
                          >
                            {execution.status === "running"
                              ? "実行中"
                              : execution.status === "completed"
                              ? "完了"
                              : execution.status === "error"
                              ? "エラー"
                              : "待機中"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 p-0 rounded-xl"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    {execution.status === "running" && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm font-medium text-base-content/80 mb-2">
                          <span>進捗状況</span>
                          <span>{execution.progress}%</span>
                        </div>
                        <div className="relative w-full bg-base-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out relative"
                            style={{ width: `${execution.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse">
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Steps */}
                    <div className="space-y-3">
                      {execution.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-center space-x-4 p-4 rounded-xl bg-base-200/40 border border-base-300/30"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-base-100 to-base-200 rounded-lg flex items-center justify-center border border-base-300/50">
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="text-sm font-semibold text-base-content">
                                {index + 1}. {step.name}
                              </span>
                              {step.status === "active" && (
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse">
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-base-content/70 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
