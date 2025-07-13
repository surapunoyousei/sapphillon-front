import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Code,
  FileText,
  Globe,
  Mail,
  Map,
  Pause,
  Play,
  Sparkles,
  Square,
  Terminal,
  Zap,
} from "lucide-react";
import { Button } from "../components/common/button.tsx";
import { Card } from "../components/common/card.tsx";

interface ExecutionStep {
  id: string;
  title: string;
  plugin: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  startTime?: Date;
  endTime?: Date;
  logs: LogEntry[];
  result?: any;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success";
  message: string;
  details?: string;
}

export function WorkflowExecutionPage() {
  const [workflowName] = useState("ファイル整理ワークフロー");
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [progress, setProgress] = useState(15);

  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([
    {
      id: "1",
      title: "対象フォルダ検索",
      plugin: "ファイルマネージャー",
      description: "デスクトップフォルダ内のファイルを検索します",
      status: "completed",
      startTime: new Date(Date.now() - 5000),
      endTime: new Date(Date.now() - 3000),
      logs: [
        {
          id: "1",
          timestamp: new Date(Date.now() - 5000),
          level: "info",
          message: "ファイルマネージャープラグインを初期化しました",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 4500),
          level: "info",
          message: "デスクトップフォルダ (~/Desktop) にアクセスしています",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 3500),
          level: "success",
          message: "47個のファイルを発見しました",
        },
      ],
      result: {
        filesFound: 47,
        path: "~/Desktop",
        duration: "2.1秒",
      },
    },
    {
      id: "2",
      title: "ファイル種別判定",
      plugin: "ファイルマネージャー",
      description: "見つかったファイルの種類を判定します",
      status: "active",
      startTime: new Date(Date.now() - 2000),
      logs: [
        {
          id: "1",
          timestamp: new Date(Date.now() - 2000),
          level: "info",
          message: "ファイル種別判定を開始しました",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 1800),
          level: "info",
          message: "JPEG画像: 12個検出",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 1600),
          level: "info",
          message: "PNG画像: 8個検出",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 1400),
          level: "info",
          message: "PDF文書: 5個検出",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 1000),
          level: "info",
          message: "処理中... (進捗: 68%)",
        },
      ],
    },
    {
      id: "3",
      title: "整理フォルダ作成",
      plugin: "ファイルマネージャー",
      description: "「整理済み画像」フォルダを作成します",
      status: "pending",
      logs: [],
    },
    {
      id: "4",
      title: "ファイル移動",
      plugin: "ファイルマネージャー",
      description: "画像ファイルを整理フォルダに移動します",
      status: "pending",
      logs: [],
    },
  ]);

  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([
    {
      id: "global-1",
      timestamp: new Date(Date.now() - 6000),
      level: "info",
      message: "ワークフロー実行を開始しました",
    },
    {
      id: "global-2",
      timestamp: new Date(Date.now() - 5500),
      level: "info",
      message: "ファイルマネージャープラグインを読み込みました",
    },
    {
      id: "global-3",
      timestamp: new Date(Date.now() - 3000),
      level: "success",
      message: "ステップ1が完了しました",
    },
    {
      id: "global-4",
      timestamp: new Date(Date.now() - 2000),
      level: "info",
      message: "ステップ2を開始しました",
    },
  ]);

  // シミュレーション用の自動更新
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      // 進捗を更新
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 5;
        return newProgress > 100 ? 100 : newProgress;
      });

      // アクティブなステップにランダムでログを追加
      const activeStep = executionSteps.find((step) =>
        step.status === "active"
      );
      if (activeStep && Math.random() > 0.7) {
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: Math.random() > 0.8 ? "warning" : "info",
          message: `処理中... (進捗: ${Math.floor(Math.random() * 30 + 70)}%)`,
        };

        setExecutionSteps((prev) =>
          prev.map((step) =>
            step.id === activeStep.id
              ? { ...step, logs: [...step.logs, newLog] }
              : step
          )
        );

        setGlobalLogs((prev) => [...prev, newLog]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, executionSteps]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const getStepIcon = (plugin: string) => {
    switch (plugin) {
      case "ファイルマネージャー":
        return FileText;
      case "Webスクレイピング":
        return Globe;
      case "メール操作":
        return Mail;
      case "Google Maps":
        return Map;
      default:
        return FileText;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-error" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-info" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="badge badge-success badge-sm">完了</span>;
      case "active":
        return <span className="badge badge-primary badge-sm">実行中</span>;
      case "error":
        return <span className="badge badge-error badge-sm">エラー</span>;
      default:
        return <span className="badge badge-ghost badge-sm">待機中</span>;
    }
  };

  const selectedStep = selectedStepId
    ? executionSteps.find((step) => step.id === selectedStepId)
    : executionSteps[currentStepIndex];

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content mb-2">
              {workflowName}
            </h1>
            <p className="text-base-content/70">
              {isRunning ? "実行中..." : "実行完了"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handlePauseResume}
              variant={isPaused ? "primary" : "light"}
              size="sm"
              disabled={!isRunning}
            >
              {isPaused
                ? <Play className="w-4 h-4" />
                : <Pause className="w-4 h-4" />}
              {isPaused ? "再開" : "一時停止"}
            </Button>
            <Button
              onClick={handleStop}
              variant="light"
              size="sm"
              className="text-error"
              disabled={!isRunning}
            >
              <Square className="w-4 h-4" />
              停止
            </Button>
          </div>
        </div>

        {/* 進捗バー */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-base-content">
              全体進捗
            </h2>
            <span className="text-sm font-medium text-base-content">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse">
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ステップ一覧 */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-base-content">
                実行ステップ
              </h2>
              <div className="space-y-3">
                {executionSteps.map((step, index) => {
                  const Icon = getStepIcon(step.plugin);
                  const isSelected = selectedStepId === step.id ||
                    (!selectedStepId && index === currentStepIndex);

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-primary/40 bg-primary/5"
                          : "border-base-300/30 hover:border-base-300/50 hover:bg-base-200/30"
                      }`}
                      onClick={() => setSelectedStepId(step.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-base-content text-sm">
                              {step.title}
                            </h3>
                            {getStatusBadge(step.status)}
                          </div>
                          <p className="text-xs text-base-content/60 mb-2">
                            {step.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-base-200/60 text-base-content/70 rounded">
                              {step.plugin}
                            </span>
                            {step.logs.length > 0 && (
                              <span className="text-xs text-base-content/50">
                                {step.logs.length} ログ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ステップ詳細とログ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ステップ詳細 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-base-content">
                  ステップ詳細
                </h2>
                {selectedStep && getStatusBadge(selectedStep.status)}
              </div>

              {selectedStep && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-base-200/30 rounded-xl">
                      <h3 className="font-medium text-base-content mb-2">
                        ステップ情報
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-base-content/70">
                            タイトル:
                          </span>
                          <span className="text-base-content">
                            {selectedStep.title}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/70">
                            プラグイン:
                          </span>
                          <span className="text-base-content">
                            {selectedStep.plugin}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base-content/70">状態:</span>
                          <span className="text-base-content">
                            {selectedStep.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-base-200/30 rounded-xl">
                      <h3 className="font-medium text-base-content mb-2">
                        実行時間
                      </h3>
                      <div className="space-y-2 text-sm">
                        {selectedStep.startTime && (
                          <div className="flex justify-between">
                            <span className="text-base-content/70">
                              開始時刻:
                            </span>
                            <span className="text-base-content">
                              {selectedStep.startTime.toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        {selectedStep.endTime && (
                          <div className="flex justify-between">
                            <span className="text-base-content/70">
                              終了時刻:
                            </span>
                            <span className="text-base-content">
                              {selectedStep.endTime.toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        {selectedStep.result?.duration && (
                          <div className="flex justify-between">
                            <span className="text-base-content/70">
                              実行時間:
                            </span>
                            <span className="text-base-content">
                              {selectedStep.result.duration}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedStep.result && (
                    <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
                      <h3 className="font-medium text-success mb-2">
                        実行結果
                      </h3>
                      <pre className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {JSON.stringify(selectedStep.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* ログ表示 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-base-content flex items-center">
                  <Terminal className="w-5 h-5 mr-2" />
                  実行ログ
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-base-300/20 rounded-xl p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {selectedStep?.logs && selectedStep.logs.length > 0
                    ? (
                      selectedStep.logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-3 p-2 rounded-lg hover:bg-base-200/30 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getLogIcon(log.level)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-base-content/50 font-mono">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  log.level === "success"
                                    ? "bg-success/20 text-success"
                                    : log.level === "error"
                                    ? "bg-error/20 text-error"
                                    : log.level === "warning"
                                    ? "bg-warning/20 text-warning"
                                    : "bg-info/20 text-info"
                                }`}
                              >
                                {log.level.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-base-content mt-1">
                              {log.message}
                            </p>
                            {log.details && (
                              <p className="text-xs text-base-content/60 mt-1">
                                {log.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )
                    : (
                      <div className="text-center py-8 text-base-content/50">
                        <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>ログがありません</p>
                      </div>
                    )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
