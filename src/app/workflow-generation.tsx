import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Clock,
  Code,
  Cpu,
  Database,
  FileText,
  Globe,
  Mail,
  Map,
  Play,
  Puzzle,
  Search,
  Settings,
  Sparkles,
  User,
  Workflow,
  X,
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

export function WorkflowGenerationPage() {
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [currentPhase, setCurrentPhase] = useState<
    "input" | "analyzing" | "generating" | "confirming" | "executing"
  >("input");
  const [isGenerating, setIsGenerating] = useState(false);

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
    },
    {
      id: "plugins",
      title: "プラグイン検索",
      description: "タスクに必要なプラグインを検索・選択します",
      status: "pending",
    },
    {
      id: "workflow",
      title: "ワークフロー生成",
      description: "最適なワークフローを生成します",
      status: "pending",
    },
    {
      id: "validation",
      title: "検証・最適化",
      description: "生成されたワークフローを検証し、最適化します",
      status: "pending",
    },
  ]);

  const [availablePlugins] = useState<PluginItem[]>([
    {
      id: "file-manager",
      name: "ファイルマネージャー",
      description: "ファイルの検索、整理、操作",
      icon: FileText,
      selected: false,
    },
    {
      id: "web-scraper",
      name: "Webスクレイピング",
      description: "Webサイトから情報を抽出",
      icon: Globe,
      selected: false,
    },
    {
      id: "mail-client",
      name: "メール操作",
      description: "メールの送受信・管理",
      icon: Mail,
      selected: false,
    },
    {
      id: "google-maps",
      name: "Google Maps",
      description: "地図・位置情報の取得",
      icon: Map,
      selected: false,
    },
    {
      id: "system-monitor",
      name: "システム監視",
      description: "システム状態の監視",
      icon: Cpu,
      selected: false,
    },
  ]);

  const [selectedPlugins, setSelectedPlugins] = useState<PluginItem[]>([]);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<WorkflowStep[]>(
    [],
  );

  const handleStartGeneration = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setCurrentPhase("analyzing");

    // プロンプト解析シミュレーション
    await simulateStep(
      "parse",
      "ユーザーの意図: ファイル整理タスクを検出しました",
    );

    // プラグイン検索シミュレーション
    await simulateStep(
      "plugins",
      "ファイルマネージャープラグインを選択しました",
    );
    const selectedPluginItems = availablePlugins.filter((p) =>
      p.id === "file-manager"
    );
    setSelectedPlugins(selectedPluginItems);

    // ワークフロー生成シミュレーション
    await simulateStep("workflow", "4ステップのワークフローを生成しました");
    const workflow: WorkflowStep[] = [
      {
        id: "1",
        title: "対象フォルダ検索",
        plugin: "ファイルマネージャー",
        description: "デスクトップフォルダ内のファイルを検索します",
        params: { path: "~/Desktop", recursive: true },
      },
      {
        id: "2",
        title: "ファイル種別判定",
        plugin: "ファイルマネージャー",
        description: "見つかったファイルの種類を判定します",
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
        title: "ファイル移動",
        plugin: "ファイルマネージャー",
        description: "画像ファイルを整理フォルダに移動します",
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
      // アクティブ状態に変更
      setGenerationSteps((prev) =>
        prev.map((step) =>
          step.id === stepId ? { ...step, status: "active" } : step
        )
      );

      setTimeout(() => {
        // 完了状態に変更
        setGenerationSteps((prev) =>
          prev.map((step) =>
            step.id === stepId
              ? { ...step, status: "completed", details }
              : step
          )
        );
        resolve();
      }, 1500);
    });
  };

  const handleExecuteWorkflow = () => {
    setCurrentPhase("executing");
    // 実行処理をシミュレーション
    console.log("ワークフローを実行中...");
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

  const renderAnalyzingPhase = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          ワークフロー生成中
        </h1>
        <p className="text-base-content/70">
          「{prompt}」を解析しています...
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 生成ステップ */}
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Workflow className="w-6 h-6 mr-3 text-primary" />
            生成ステップ
          </h2>
          <div className="space-y-4">
            {generationSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {step.status === "completed"
                    ? (
                      <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-success-content" />
                      </div>
                    )
                    : step.status === "active"
                    ? (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-primary-content border-t-transparent rounded-full animate-spin" />
                      </div>
                    )
                    : (
                      <div className="w-8 h-8 bg-base-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-base-content">
                          {index + 1}
                        </span>
                      </div>
                    )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-base-content">
                      {step.title}
                    </h3>
                    {step.status === "active" && (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-base-content/70 mt-1">
                    {step.description}
                  </p>
                  {step.details && (
                    <p className="text-sm text-success font-medium mt-2">
                      {step.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 選択されたプラグイン */}
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Puzzle className="w-6 h-6 mr-3 text-primary" />
            選択されたプラグイン
          </h2>
          <div className="space-y-4">
            {selectedPlugins.length === 0
              ? (
                <div className="text-center py-8 text-base-content/50">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>プラグインを選択中...</p>
                </div>
              )
              : (
                selectedPlugins.map((plugin) => {
                  const Icon = plugin.icon;
                  return (
                    <div
                      key={plugin.id}
                      className="flex items-center space-x-4 p-4 bg-base-200/50 rounded-xl"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base-content">
                          {plugin.name}
                        </h3>
                        <p className="text-sm text-base-content/70">
                          {plugin.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        </Card>
      </div>
    </div>
  );

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

  const renderExecutingPhase = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          ワークフロー実行中
        </h1>
        <p className="text-base-content/70">
          タスクを実行しています...
        </p>
      </div>

      <Card className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-lg font-medium text-base-content mb-2">
            実行中...
          </p>
          <p className="text-base-content/70">
            実行が完了するまでお待ちください
          </p>
        </div>
      </Card>
    </div>
  );

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
