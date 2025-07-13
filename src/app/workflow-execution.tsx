import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  Map,
  Pause,
  Play,
  Square,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { Button } from "../components/common/button.tsx";
import { Card } from "../components/common/card.tsx";

interface ExecutionStep {
  id: string;
  title: string;
  plugin: string;
  description: string;
  status: "pending" | "active" | "completed" | "error" | "skipped";
  startTime?: Date;
  endTime?: Date;
  logs: LogEntry[];
  result?: any;
  expanded?: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success" | "debug";
  message: string;
  details?: string;
}

export function WorkflowExecutionPage() {
  const [workflowName] = useState("ファイル整理ワークフロー");
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [startTime] = useState(new Date(Date.now() - 45000));
  const [endTime, setEndTime] = useState<Date | null>(null);

  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([
    {
      id: "1",
      title: "ファイル検索の準備",
      plugin: "ファイルマネージャー",
      description:
        "デスクトップフォルダへのアクセス権限を確認し、検索を開始します",
      status: "completed",
      startTime: new Date(Date.now() - 45000),
      endTime: new Date(Date.now() - 42000),
      expanded: false,
      logs: [
        {
          id: "1",
          timestamp: new Date(Date.now() - 45000),
          level: "info",
          message: "ファイルマネージャープラグインを初期化中...",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 44500),
          level: "info",
          message: "アクセス権限を確認中",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 44000),
          level: "success",
          message: "デスクトップフォルダへのアクセス権限を取得しました",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 43500),
          level: "info",
          message: "ファイル検索エンジンを初期化中...",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 42000),
          level: "success",
          message: "初期化が完了しました (3.2s)",
        },
      ],
      result: {
        status: "success",
        duration: "3.2s",
        filesScanned: 0,
      },
    },
    {
      id: "2",
      title: "ファイル検索の実行",
      plugin: "ファイルマネージャー",
      description: "デスクトップフォルダ内のすべてのファイルを検索・分析します",
      status: "active",
      startTime: new Date(Date.now() - 42000),
      expanded: true,
      logs: [
        {
          id: "1",
          timestamp: new Date(Date.now() - 42000),
          level: "info",
          message: "ファイル検索を開始しました",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 41000),
          level: "info",
          message: "スキャン中: ~/Desktop/",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 40000),
          level: "debug",
          message: "発見: image1.jpg (2.3MB)",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 39500),
          level: "debug",
          message: "発見: photo.png (1.8MB)",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 39000),
          level: "debug",
          message: "発見: document.pdf (4.1MB)",
        },
        {
          id: "6",
          timestamp: new Date(Date.now() - 38500),
          level: "info",
          message: "スキャン中: ~/Desktop/old_files/",
        },
        {
          id: "7",
          timestamp: new Date(Date.now() - 38000),
          level: "debug",
          message: "発見: screenshot.png (0.9MB)",
        },
        {
          id: "8",
          timestamp: new Date(Date.now() - 5000),
          level: "info",
          message: "進捗: 47/82 ファイル処理済み (57%)",
        },
      ],
    },
    {
      id: "3",
      title: "ファイル分類",
      plugin: "ファイルマネージャー",
      description: "発見されたファイルを種類ごとに分類し、整理方針を決定します",
      status: "pending",
      expanded: false,
      logs: [],
    },
    {
      id: "4",
      title: "フォルダ構造の作成",
      plugin: "ファイルマネージャー",
      description: "整理用のフォルダ構造を作成します",
      status: "pending",
      expanded: false,
      logs: [],
    },
    {
      id: "5",
      title: "ファイルの移動",
      plugin: "ファイルマネージャー",
      description: "分類されたファイルを適切なフォルダに移動します",
      status: "pending",
      expanded: false,
      logs: [],
    },
  ]);

  // シミュレーション用の自動更新
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      const activeStep = executionSteps.find((step) =>
        step.status === "active"
      );
      if (activeStep && Math.random() > 0.6) {
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: Math.random() > 0.8 ? "debug" : "info",
          message: Math.random() > 0.5
            ? `進捗: ${
              Math.floor(Math.random() * 30 + 50)
            }/82 ファイル処理済み (${Math.floor(Math.random() * 30 + 60)}%)`
            : `発見: file_${Math.floor(Math.random() * 100)}.${
              Math.random() > 0.5 ? "jpg" : "png"
            } (${(Math.random() * 5 + 0.5).toFixed(1)}MB)`,
        };

        setExecutionSteps((prev) =>
          prev.map((step) =>
            step.id === activeStep.id
              ? { ...step, logs: [...step.logs, newLog] }
              : step
          )
        );
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, executionSteps]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setEndTime(new Date());
  };

  const toggleStepExpansion = (stepId: string) => {
    setExecutionSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, expanded: !step.expanded } : step
      )
    );
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "active":
        return (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      case "error":
        return <X className="w-5 h-5 text-error" />;
      case "skipped":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Clock className="w-5 h-5 text-base-content/40" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-l-success";
      case "active":
        return "border-l-primary";
      case "error":
        return "border-l-error";
      case "skipped":
        return "border-l-warning";
      default:
        return "border-l-base-content/20";
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "success":
        return <CheckCircle className="w-3 h-3 text-success" />;
      case "error":
        return <X className="w-3 h-3 text-error" />;
      case "warning":
        return <AlertCircle className="w-3 h-3 text-warning" />;
      case "debug":
        return <Code className="w-3 h-3 text-base-content/40" />;
      default:
        return <Terminal className="w-3 h-3 text-info" />;
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) {
      const duration = Math.floor((Date.now() - start.getTime()) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    }
  };

  const completedSteps =
    executionSteps.filter((step) => step.status === "completed").length;
  const totalSteps = executionSteps.length;
  const progress = (completedSteps / totalSteps) * 100;
  const hasActiveStep = executionSteps.some((step) => step.status === "active");

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hasActiveStep
                    ? "bg-primary/20"
                    : endTime
                    ? "bg-success/20"
                    : "bg-error/20"
                }`}
              >
                {hasActiveStep
                  ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )
                  : endTime
                  ? <CheckCircle className="w-5 h-5 text-success" />
                  : <X className="w-5 h-5 text-error" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-base-content">
                  {workflowName}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-base-content/70">
                  <span>
                    {hasActiveStep ? "実行中" : endTime ? "完了" : "停止済み"}
                  </span>
                  <span>•</span>
                  <span>
                    実行時間: {formatDuration(startTime, endTime || undefined)}
                  </span>
                  <span>•</span>
                  <span>
                    {completedSteps}/{totalSteps} ステップ完了
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePauseResume}
                variant="light"
                size="sm"
                disabled={!isRunning}
              >
                {isPaused
                  ? <Play className="w-4 h-4" />
                  : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleStop}
                variant="light"
                size="sm"
                className="text-error"
                disabled={!isRunning}
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button variant="light" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 進捗バー */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-base-content/70 mb-2">
              <span>全体進捗</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ステップ一覧 */}
        <div className="space-y-2 mb-8">
          {executionSteps.map((step, index) => (
            <Card
              key={step.id}
              className={`border-l-4 ${
                getStatusColor(step.status)
              } transition-all duration-200`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleStepExpansion(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStepIcon(step.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-base-content">
                          {step.title}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-base-200/60 text-base-content/70 rounded">
                          {step.plugin}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/70 mt-1">
                        {step.description}
                      </p>
                      {step.status !== "pending" && (
                        <div className="flex items-center space-x-4 mt-2 text-xs text-base-content/60">
                          {step.startTime && (
                            <span>
                              開始: {step.startTime.toLocaleTimeString()}
                            </span>
                          )}
                          {step.endTime && (
                            <span>
                              時間:{" "}
                              {formatDuration(step.startTime!, step.endTime)}
                            </span>
                          )}
                          {step.logs.length > 0 && (
                            <span>
                              {step.logs.length} ログエントリ
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {step.logs.length > 0 && (
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                    {step.logs.length > 0 && (
                      <div className="text-base-content/40">
                        {step.expanded
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 展開されたログ */}
              {step.expanded && step.logs.length > 0 && (
                <div className="border-t border-base-300/30 bg-base-200/20">
                  <div className="p-4">
                    <div className="bg-base-300/10 rounded-lg p-3 max-h-60 overflow-y-auto font-mono text-sm">
                      {step.logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-2 py-1 hover:bg-base-200/20 rounded px-2 -mx-2"
                        >
                          <span className="text-xs text-base-content/50 mt-0.5 w-20 flex-shrink-0">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <div className="flex-shrink-0 mt-1">
                            {getLogIcon(log.level)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded text-white mr-2 ${
                                log.level === "success"
                                  ? "bg-success"
                                  : log.level === "error"
                                  ? "bg-error"
                                  : log.level === "warning"
                                  ? "bg-warning"
                                  : log.level === "debug"
                                  ? "bg-base-content/40"
                                  : "bg-info"
                              }`}
                            >
                              {log.level.toUpperCase()}
                            </span>
                            <span className="text-base-content/80">
                              {log.message}
                            </span>
                            {log.details && (
                              <div className="text-xs text-base-content/60 mt-1 ml-12">
                                {log.details}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {step.status === "active" && (
                        <div className="flex items-center space-x-2 py-1 text-primary">
                          <span className="text-xs text-base-content/50 w-20">
                            {new Date().toLocaleTimeString()}
                          </span>
                          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm animate-pulse">
                            実行中...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* フッター統計 */}
        <div className="mt-8 pt-6 border-t border-base-300/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">
                {executionSteps.filter((s) => s.status === "completed").length}
              </div>
              <div className="text-sm text-base-content/70">完了</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {executionSteps.filter((s) => s.status === "active").length}
              </div>
              <div className="text-sm text-base-content/70">実行中</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-base-content/50">
                {executionSteps.filter((s) => s.status === "pending").length}
              </div>
              <div className="text-sm text-base-content/70">待機中</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-error">
                {executionSteps.filter((s) => s.status === "error").length}
              </div>
              <div className="text-sm text-base-content/70">失敗</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
