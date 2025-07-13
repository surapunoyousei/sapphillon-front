import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  Map,
  Pause,
  Play,
  Puzzle,
  Search,
  Settings,
  Sparkles,
  Square,
  Terminal,
  User,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { Button } from "../components/common/button.tsx";
import { Card } from "../components/common/card.tsx";
import { Input } from "../components/common/input.tsx";

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  details?: string;
  startTime?: Date;
  endTime?: Date;
  logs: LogEntry[];
  expanded?: boolean;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success" | "debug";
  message: string;
  details?: string;
}

interface PluginItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  selected: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  plugin: string;
  description: string;
  params?: Record<string, any>;
}

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

export function WorkflowGenerationPage() {
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [currentPhase, setCurrentPhase] = useState<
    "input" | "analyzing" | "generating" | "confirming" | "executing"
  >("input");
  const [isGenerating, setIsGenerating] = useState(false);

  // 実行フェーズの状態管理
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecutionPaused, setIsExecutionPaused] = useState(false);
  const [executionStartTime, setExecutionStartTime] = useState<Date | null>(
    null,
  );
  const [executionEndTime, setExecutionEndTime] = useState<Date | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);

  // URLパラメータからプロンプトを取得
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      setPrompt(urlPrompt);
    }
  }, [searchParams]);

  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: "parse",
      title: "プロンプト解析",
      description: "入力されたプロンプトを解析し、ユーザーの意図を理解します",
      status: "pending",
      logs: [],
      expanded: false,
    },
    {
      id: "plugins",
      title: "プラグイン検索",
      description: "タスクに必要なプラグインを検索・選択します",
      status: "pending",
      logs: [],
      expanded: false,
    },
    {
      id: "workflow",
      title: "ワークフロー生成",
      description: "最適なワークフローを生成します",
      status: "pending",
      logs: [],
      expanded: false,
    },
    {
      id: "validation",
      title: "検証・最適化",
      description: "生成されたワークフローを検証し、最適化します",
      status: "pending",
      logs: [],
      expanded: false,
    },
  ]);

  const [availablePlugins] = useState<PluginItem[]>([
    {
      id: "file-manager",
      name: "ファイルマネージャー",
      description: "ファイルの検索、移動、コピーなどの操作を行います",
      icon: FileText,
      selected: true,
    },
    {
      id: "web-scraper",
      name: "ウェブスクレイパー",
      description: "ウェブサイトからデータを抽出します",
      icon: Globe,
      selected: false,
    },
    {
      id: "email-sender",
      name: "メール送信",
      description: "メールの送信を行います",
      icon: Mail,
      selected: false,
    },
    {
      id: "image-processor",
      name: "画像処理",
      description: "画像のリサイズや変換などを行います",
      icon: Map,
      selected: false,
    },
    {
      id: "code-executor",
      name: "コード実行",
      description: "スクリプトやコードの実行を行います",
      icon: Code,
      selected: false,
    },
    {
      id: "automation",
      name: "自動化",
      description: "繰り返し作業の自動化を行います",
      icon: Zap,
      selected: false,
    },
  ]);

  const [generatedWorkflow, setGeneratedWorkflow] = useState<WorkflowStep[]>(
    [],
  );

  // 実行シミュレーション
  useEffect(() => {
    if (!isExecuting || isExecutionPaused) return;

    const interval = setInterval(() => {
      const activeStep = executionSteps.find((step) =>
        step.status === "active"
      );
      if (activeStep && Math.random() > 0.6) {
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: Math.random() > 0.8 ? "debug" : "info",
          message: getExecutionLogMessage(activeStep.id),
        };

        setExecutionSteps((prev) =>
          prev.map((step) =>
            step.id === activeStep.id
              ? { ...step, logs: [...step.logs, newLog] }
              : step
          )
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isExecuting, isExecutionPaused, executionSteps]);

  const getExecutionLogMessage = (stepId: string): string => {
    const messages: Record<string, string[]> = {
      "1": [
        "アクセス権限を確認中...",
        "ファイルシステムAPI初期化完了",
        "デスクトップフォルダにアクセス中",
        "初期化が完了しました",
      ],
      "2": [
        "ファイルスキャンを開始しました",
        `発見: image_${Math.floor(Math.random() * 100)}.jpg`,
        `処理中: ${Math.floor(Math.random() * 50 + 30)}/82 ファイル`,
        "メタデータを読み込み中",
      ],
      "3": [
        "ファイル分類アルゴリズムを開始",
        "画像ファイルを検出しました",
        "PDF文書を検出しました",
        "分類規則を適用中",
      ],
      "4": [
        "フォルダ構造を作成中",
        "「整理済み画像」フォルダを作成",
        "「文書」フォルダを作成",
        "権限設定を確認中",
      ],
      "5": [
        "ファイル移動を開始",
        `移動完了: ${Math.floor(Math.random() * 20 + 10)} 個のファイル`,
        "重複チェックを実行中",
        "整理処理を完了しました",
      ],
    };

    const stepMessages = messages[stepId] || ["処理中..."];
    return stepMessages[Math.floor(Math.random() * stepMessages.length)];
  };

  const handleStartGeneration = async () => {
    setCurrentPhase("analyzing");
    setIsGenerating(true);

    // プロンプト解析シミュレーション
    await simulateStep("parse", "プロンプト解析が完了しました");

    // プラグイン検索シミュレーション
    await simulateStep("plugins", "適切なプラグインが見つかりました");

    // ワークフロー生成シミュレーション
    await simulateStep("workflow", "最適なワークフローが生成されました");

    // 模擬的なワークフロー生成
    const workflow: WorkflowStep[] = [
      {
        id: "1",
        title: "ファイル検索の準備",
        plugin: "ファイルマネージャー",
        description: "デスクトップフォルダの権限確認と検索準備",
        params: { target: "~/Desktop" },
      },
      {
        id: "2",
        title: "ファイル検索",
        plugin: "ファイルマネージャー",
        description: "画像ファイルの検索と一覧作成",
        params: { filter: "images" },
      },
      {
        id: "3",
        title: "整理フォルダ作成",
        plugin: "ファイルマネージャー",
        description: "「整理済み画像」フォルダを作成します",
        params: { folderName: "整理済み画像", location: "~/Desktop" },
      },
      {
        id: "4",
        title: "フォルダ構造作成",
        plugin: "ファイルマネージャー",
        description: "日付別のサブフォルダを作成します",
        params: { structure: "date-based" },
      },
      {
        id: "5",
        title: "ファイル移動",
        plugin: "ファイルマネージャー",
        description: "画像ファイルを適切なフォルダに移動します",
        params: { destination: "~/Desktop/整理済み画像" },
      },
    ];
    setGeneratedWorkflow(workflow);

    // 検証・最適化シミュレーション
    await simulateStep("validation", "ワークフローの検証が完了しました");

    setCurrentPhase("confirming");
    setIsGenerating(false);
  };

  const simulateStep = async (
    stepId: string,
    details: string,
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = new Date();

      // アクティブ状態に変更
      setGenerationSteps((prev) =>
        prev.map((step) =>
          step.id === stepId
            ? {
              ...step,
              status: "active",
              startTime,
              expanded: true,
              logs: [{
                id: Date.now().toString(),
                timestamp: startTime,
                level: "info",
                message: `${step.title}を開始しました`,
              }],
            }
            : step
        )
      );

      // ステップごとのログをシミュレート
      const stepLogs = getStepLogs(stepId);
      let logIndex = 1;

      const addLog = () => {
        if (logIndex < stepLogs.length) {
          const log = stepLogs[logIndex];
          setGenerationSteps((prev) =>
            prev.map((step) =>
              step.id === stepId
                ? {
                  ...step,
                  logs: [...step.logs, {
                    ...log,
                    id: `${stepId}-${logIndex}`,
                    timestamp: new Date(),
                  }],
                }
                : step
            )
          );
          logIndex++;
          setTimeout(addLog, 800 + Math.random() * 400);
        } else {
          // 完了状態に変更
          setGenerationSteps((prev) =>
            prev.map((step) =>
              step.id === stepId
                ? {
                  ...step,
                  status: "completed",
                  details,
                  endTime: new Date(),
                  logs: [...step.logs, {
                    id: `${stepId}-final`,
                    timestamp: new Date(),
                    level: "success",
                    message: `${step.title}が完了しました`,
                  }],
                }
                : step
            )
          );
          resolve();
        }
      };

      setTimeout(addLog, 800);
    });
  };

  const getStepLogs = (
    stepId: string,
  ): Omit<LogEntry, "id" | "timestamp">[] => {
    switch (stepId) {
      case "parse":
        return [
          { level: "info", message: "自然言語解析エンジンを初期化中..." },
          {
            level: "debug",
            message:
              "トークン化を実行: ['デスクトップ', 'の', '画像', 'ファイル', 'を', '整理']",
          },
          { level: "info", message: "意図分析: ファイル操作タスクを検出" },
          {
            level: "debug",
            message: "対象: ファイルタイプ=画像, 場所=デスクトップ, 操作=整理",
          },
          { level: "info", message: "信頼度スコア: 96%" },
        ];
      case "plugins":
        return [
          { level: "info", message: "プラグインレジストリを検索中..." },
          { level: "debug", message: "ファイルマネージャープラグインを発見" },
          { level: "info", message: "互換性チェック: ✓ ファイル操作API" },
          { level: "debug", message: "権限確認: ファイルシステムアクセス" },
          { level: "info", message: "プラグイン選択完了: file-manager v2.1.0" },
        ];
      case "workflow":
        return [
          { level: "info", message: "ワークフロー設計を開始..." },
          { level: "debug", message: "ステップ1: ファイル検索を計画" },
          { level: "debug", message: "ステップ2: ファイル分類を計画" },
          { level: "debug", message: "ステップ3: フォルダ作成を計画" },
          { level: "debug", message: "ステップ4: ファイル移動を計画" },
          { level: "info", message: "依存関係を解析中..." },
          { level: "info", message: "最適化完了: 5ステップのワークフロー" },
        ];
      case "validation":
        return [
          { level: "info", message: "ワークフロー検証を開始..." },
          { level: "debug", message: "セキュリティチェック: 安全な操作のみ" },
          {
            level: "debug",
            message: "パフォーマンステスト: 推定実行時間 < 45秒",
          },
          { level: "info", message: "エラーハンドリング設定完了" },
          { level: "success", message: "検証完了: 実行可能" },
        ];
      default:
        return [];
    }
  };

  const handleExecuteWorkflow = async () => {
    setCurrentPhase("executing");
    setIsExecuting(true);
    setExecutionStartTime(new Date());

    // WorkflowStepからExecutionStepに変換
    const execSteps: ExecutionStep[] = generatedWorkflow.map((step, index) => ({
      id: step.id,
      title: step.title,
      plugin: step.plugin,
      description: step.description,
      status: index === 0 ? "active" : "pending",
      startTime: index === 0 ? new Date() : undefined,
      logs: index === 0
        ? [{
          id: "init",
          timestamp: new Date(),
          level: "info",
          message: `${step.title}を開始しました`,
        }]
        : [],
      expanded: index === 0,
    }));

    setExecutionSteps(execSteps);

    // 実行シミュレーション
    await simulateExecution(execSteps);
  };

  const simulateExecution = async (steps: ExecutionStep[]) => {
    for (let i = 0; i < steps.length; i++) {
      if (!isExecuting) break;

      const step = steps[i];

      // 実行時間をシミュレート
      await new Promise((resolve) =>
        setTimeout(resolve, 8000 + Math.random() * 4000)
      );

      // ステップ完了
      setExecutionSteps((prev) =>
        prev.map((s) =>
          s.id === step.id
            ? {
              ...s,
              status: "completed" as const,
              endTime: new Date(),
              logs: [...s.logs, {
                id: `${step.id}-complete`,
                timestamp: new Date(),
                level: "success",
                message: `${step.title}が完了しました`,
              }],
            }
            : s.id === steps[i + 1]?.id
            ? {
              ...s,
              status: "active" as const,
              startTime: new Date(),
              expanded: true,
              logs: [{
                id: `${s.id}-start`,
                timestamp: new Date(),
                level: "info",
                message: `${s.title}を開始しました`,
              }],
            }
            : s
        )
      );
    }

    // 全ステップ完了
    setIsExecuting(false);
    setExecutionEndTime(new Date());
  };

  const handlePauseExecution = () => {
    setIsExecutionPaused(!isExecutionPaused);
  };

  const handleStopExecution = () => {
    setIsExecuting(false);
    setIsExecutionPaused(false);
    setExecutionEndTime(new Date());
  };

  const toggleStepExpansion = (stepId: string) => {
    setGenerationSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, expanded: !step.expanded } : step
      )
    );
  };

  const toggleExecutionStepExpansion = (stepId: string) => {
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
      default:
        return <Clock className="w-5 h-5 text-base-content/40" />;
    }
  };

  const getExecutionStepIcon = (status: string) => {
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

  const renderInputPhase = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-base-content mb-4">
          ワークフロー生成
        </h1>
        <p className="text-xl text-base-content/70 font-medium">
          自然言語でタスクを説明してください。AIが最適なワークフローを生成します。
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-base-100/80 via-base-100 to-base-200/50 backdrop-blur-sm border-2 border-primary/10 shadow-2xl">
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-4 z-10">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-content" />
              </div>
            </div>
            <Input
              type="text"
              placeholder="例: 「デスクトップの画像ファイルを整理してください」"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="pl-16 pr-4 h-16 text-lg bg-base-100/90 border-2 border-primary/20 focus:border-primary/40 rounded-2xl shadow-lg backdrop-blur-sm"
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleStartGeneration}
              disabled={!prompt.trim() || isGenerating}
              variant="primary"
              className="px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
            >
              {isGenerating
                ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-content border-t-transparent rounded-full animate-spin mr-2" />
                    生成中...
                  </>
                )
                : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    ワークフロー生成開始
                  </>
                )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAnalyzingPhase = () => {
    const completedSteps =
      generationSteps.filter((step) => step.status === "completed").length;
    const totalSteps = generationSteps.length;
    const progress = (completedSteps / totalSteps) * 100;
    const hasActiveStep = generationSteps.some((step) =>
      step.status === "active"
    );

    return (
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hasActiveStep ? "bg-primary/20" : "bg-success/20"
                }`}
              >
                {hasActiveStep
                  ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )
                  : <CheckCircle className="w-5 h-5 text-success" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-base-content">
                  ワークフロー生成中
                </h1>
                <div className="flex items-center space-x-4 text-sm text-base-content/70">
                  <span>
                    {hasActiveStep ? "生成中" : "生成完了"}
                  </span>
                  <span>•</span>
                  <span>
                    プロンプト: "{prompt}"
                  </span>
                  <span>•</span>
                  <span>
                    {completedSteps}/{totalSteps} ステップ完了
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 進捗バー */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-base-content/70 mb-2">
              <span>生成進捗</span>
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
          {generationSteps.map((step, index) => (
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
                          AI処理
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
                            処理中...
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

        {/* 選択されたプラグイン（コンパクト表示） */}
        {availablePlugins.filter((p) => p.selected).map((plugin) => {
          const Icon = plugin.icon;
          return (
            <Card key={plugin.id} className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-base-content flex items-center">
                <Puzzle className="w-5 h-5 mr-2 text-primary" />
                選択されたプラグイン
              </h3>
              <div className="flex flex-wrap gap-3">
                <div
                  key={plugin.id}
                  className="flex items-center space-x-3 p-3 bg-base-200/50 rounded-lg border border-base-300/30"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base-content text-sm">
                      {plugin.name}
                    </h4>
                    <p className="text-xs text-base-content/60">
                      v2.1.0
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderConfirmingPhase = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          ワークフロー確認
        </h1>
        <p className="text-base-content/70">
          生成されたワークフローを確認し、実行してください
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 生成されたワークフロー */}
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <ArrowRight className="w-6 h-6 mr-3 text-primary" />
            ワークフロー
          </h2>
          <div className="space-y-4">
            {generatedWorkflow.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="flex items-start space-x-4 p-4 bg-base-200/30 rounded-xl border border-base-300/30">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-base-content">
                        {step.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                        {step.plugin}
                      </span>
                    </div>
                    <p className="text-sm text-base-content/70 mb-2">
                      {step.description}
                    </p>
                    {step.params && (
                      <div className="text-xs text-base-content/50 bg-base-100/50 rounded p-2">
                        {Object.entries(step.params).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {index < generatedWorkflow.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ChevronRight className="w-4 h-4 text-base-content/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 実行前の確認 */}
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-3 text-primary" />
            実行確認
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
              <h3 className="font-semibold text-warning mb-2">実行前の確認</h3>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• デスクトップフォルダにアクセスします</li>
                <li>• ファイルの移動を行います</li>
                <li>• 新しいフォルダを作成します</li>
              </ul>
            </div>

            <div className="p-4 bg-info/10 border border-info/20 rounded-xl">
              <h3 className="font-semibold text-info mb-2">予想される結果</h3>
              <p className="text-sm text-base-content/70">
                デスクトップの画像ファイルが「整理済み画像」フォルダに移動され、整理されます。
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleExecuteWorkflow}
                variant="primary"
                className="w-full py-3 text-lg font-semibold rounded-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                ワークフロー実行
              </Button>
              <Button
                onClick={() => setCurrentPhase("input")}
                variant="light"
                className="w-full py-3 text-lg font-semibold rounded-xl"
              >
                <X className="w-5 h-5 mr-2" />
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderExecutingPhase = () => {
    const completedSteps =
      executionSteps.filter((step) => step.status === "completed").length;
    const totalSteps = executionSteps.length;
    const progress = (completedSteps / totalSteps) * 100;
    const hasActiveStep = executionSteps.some((step) =>
      step.status === "active"
    );

    return (
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hasActiveStep
                    ? "bg-primary/20"
                    : executionEndTime
                    ? "bg-success/20"
                    : "bg-error/20"
                }`}
              >
                {hasActiveStep
                  ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )
                  : executionEndTime
                  ? <CheckCircle className="w-5 h-5 text-success" />
                  : <X className="w-5 h-5 text-error" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-base-content">
                  ワークフロー実行中
                </h1>
                <div className="flex items-center space-x-4 text-sm text-base-content/70">
                  <span>
                    {hasActiveStep
                      ? "実行中"
                      : executionEndTime
                      ? "完了"
                      : "停止済み"}
                  </span>
                  <span>•</span>
                  <span>
                    プロンプト: "{prompt}"
                  </span>
                  <span>•</span>
                  <span>
                    実行時間: {executionStartTime
                      ? formatDuration(
                        executionStartTime,
                        executionEndTime || undefined,
                      )
                      : "0m 0s"}
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
                onClick={handlePauseExecution}
                variant="light"
                size="sm"
                disabled={!isExecuting}
              >
                {isExecutionPaused
                  ? <Play className="w-4 h-4" />
                  : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleStopExecution}
                variant="light"
                size="sm"
                className="text-error"
                disabled={!isExecuting}
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
              <span>実行進捗</span>
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
                onClick={() => toggleExecutionStepExpansion(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getExecutionStepIcon(step.status)}
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
    );
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-6 py-12">
        {currentPhase === "input" && renderInputPhase()}
        {currentPhase === "analyzing" && renderAnalyzingPhase()}
        {currentPhase === "confirming" && renderConfirmingPhase()}
        {currentPhase === "executing" && renderExecutingPhase()}
      </div>
    </div>
  );
}
