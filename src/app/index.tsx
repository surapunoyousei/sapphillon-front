import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  Clock,
  Database,
  ExternalLink,
  Globe,
  Layers,
  Link,
  MessageCircle,
  Monitor,
  Play,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

interface RecentWorkflow {
  id: string;
  name: string;
  description: string;
  status: "completed" | "running" | "scheduled";
  lastRun: Date;
  nextRun?: Date;
  success: boolean;
}

interface SapphillonComponent {
  name: string;
  status: "healthy" | "warning" | "error";
  description: string;
  icon: React.ElementType;
  metrics: string;
}

interface WebIntegration {
  title: string;
  type: "search" | "web-app" | "data-sync";
  status: "active" | "idle";
  description: string;
  url?: string;
  tabs?: number;
}

interface ConnectedTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
  type: "web" | "local" | "hybrid";
}

export function Home() {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [floopSearchQuery, setFloopSearchQuery] = useState("");

  const connectedTabs: ConnectedTab[] = [
    {
      id: "tab1",
      title: "GitHub - sapphillon-front",
      url: "https://github.com/user/sapphillon-front",
      isActive: true,
      type: "web",
    },
    {
      id: "tab2",
      title: "ローカルファイル: /Documents/project",
      url: "file:///Documents/project",
      isActive: false,
      type: "local",
    },
    {
      id: "tab3",
      title: "Google Drive 統合",
      url: "https://drive.google.com",
      isActive: false,
      type: "hybrid",
    },
    {
      id: "tab4",
      title: "AI ワークフロー実行中",
      url: "floorp://workflow/email-classification",
      isActive: false,
      type: "hybrid",
    },
  ];

  const recentWorkflows: RecentWorkflow[] = [
    {
      id: "wf-1",
      name: "メール整理自動化",
      description: "重要なメールを分類し、概要を作成",
      status: "completed",
      lastRun: new Date(Date.now() - 1800000),
      success: true,
    },
    {
      id: "wf-2",
      name: "ニュース収集",
      description: "テクノロジーニュースを自動収集・要約",
      status: "running",
      lastRun: new Date(Date.now() - 300000),
      success: true,
    },
    {
      id: "wf-3",
      name: "データバックアップ",
      description: "重要ファイルのクラウド同期",
      status: "scheduled",
      lastRun: new Date(Date.now() - 86400000),
      nextRun: new Date(Date.now() + 1800000),
      success: true,
    },
  ];

  const sapphillonComponents: SapphillonComponent[] = [
    {
      name: "Controller",
      status: "healthy",
      description: "タスク管理・プラグイン制御",
      icon: Activity,
      metrics: "156 tasks managed",
    },
    {
      name: "Language Engine",
      status: "healthy",
      description: "ローカルLLM (Gemma 2B)",
      icon: Brain,
      metrics: "2.1GB memory, 45ms avg",
    },
    {
      name: "Automator",
      status: "healthy",
      description: "ワークフロー実行エンジン",
      icon: Zap,
      metrics: "3 workflows active",
    },
    {
      name: "Worker",
      status: "healthy",
      description: "ブラウザ統合インターフェース",
      icon: Globe,
      metrics: "12 tabs connected",
    },
  ];

  const webIntegrations: WebIntegration[] = [
    {
      title: "DuckDuckGo 統合検索",
      type: "search",
      status: "active",
      description: "ウェブ検索結果をローカルファイルと統合",
      url: "https://duckduckgo.com",
    },
    {
      title: "GitHub ワークフロー同期",
      type: "web-app",
      status: "active",
      description: "リポジトリの自動化タスクと連携",
      url: "https://github.com",
      tabs: 3,
    },
    {
      title: "クラウドストレージ統合",
      type: "data-sync",
      status: "active",
      description: "ローカルファイルとクラウドの境界をなくす",
      tabs: 2,
    },
  ];

  const handleNaturalLanguageSubmit = () => {
    if (naturalLanguageInput.trim()) {
      console.log("Natural language command:", naturalLanguageInput);
      // ここで実際のLLM処理やワークフロー生成を実行
      setNaturalLanguageInput("");
    }
  };

  const handleFloopSearch = () => {
    if (floopSearchQuery.trim()) {
      console.log("Floorp Search:", floopSearchQuery);
      // ウェブ+ローカル統合検索を実行
      setFloopSearchQuery("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "completed":
      case "active":
        return "text-success";
      case "warning":
      case "running":
        return "text-warning";
      case "error":
        return "text-error";
      case "scheduled":
      case "idle":
        return "text-info";
      default:
        return "text-base-content";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "completed":
        return CheckCircle;
      case "running":
        return Play;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      case "scheduled":
        return Clock;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-base-100">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* メインインターフェース: 自然言語 + Floorp Search */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">Floorp OS</h1>
              <p className="text-lg text-base-content/70">
                WebとOSの境界をなくす次世代統合プラットフォーム
              </p>
            </div>

            {/* Floorp Search */}
            <div className="card bg-primary/10 border border-primary/20 shadow-lg max-w-4xl mx-auto">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-primary">
                    Floorp Search
                  </h2>
                  <span className="badge badge-primary">統合検索エンジン</span>
                </div>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={floopSearchQuery}
                    onChange={(e) => setFloopSearchQuery(e.target.value)}
                    placeholder="「GitHubのissueを検索」「ローカルのプロジェクトファイルから○○を探して」「○○についてウェブで調べて要約して」"
                    className="input input-bordered flex-1 text-base focus:border-primary"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleFloopSearch();
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleFloopSearch}
                    disabled={!floopSearchQuery.trim()}
                  >
                    <Search className="w-4 h-4" />
                    検索
                  </button>
                </div>
                <p className="text-sm text-base-content/60">
                  ウェブ・ローカルファイル・ワークフロー・ブラウザタブを横断する統合検索
                </p>
              </div>
            </div>

            {/* 自然言語インターフェース */}
            <div className="card bg-base-200 shadow-lg max-w-4xl mx-auto">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="w-6 h-6 text-secondary" />
                  <h2 className="text-xl font-semibold">AI アシスタント</h2>
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex gap-3">
                  <textarea
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    placeholder="例: 「メールをAIで分類して、重要なものだけSlackに通知して」「GitHubのイシューを定期的にチェックして、新しいバグ報告があれば開発チームに要約を送って」"
                    className="textarea textarea-bordered flex-1 h-20 text-base focus:border-primary"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleNaturalLanguageSubmit();
                      }
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={handleNaturalLanguageSubmit}
                    disabled={!naturalLanguageInput.trim()}
                  >
                    <Zap className="w-4 h-4" />
                    実行
                  </button>
                </div>
                <p className="text-sm text-base-content/60 mt-2">
                  Ctrl+Enter で実行 • ローカルLLMが安全に処理します
                </p>
              </div>
            </div>
          </div>

          {/* Web統合ダッシュボード */}
          <div className="card bg-base-200 border border-primary/20 shadow-lg">
            <div className="card-body p-4">
              <h2 className="card-title mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Web統合ダッシュボード
                <span className="badge badge-primary badge-sm">
                  リアルタイム
                </span>
              </h2>

              {/* 接続タブ */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  接続中のタブ・環境
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {connectedTabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`p-3 rounded-lg border transition-all ${
                        tab.isActive
                          ? "border-primary bg-primary/10"
                          : "border-base-300 bg-base-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {tab.type === "web" && (
                            <ExternalLink className="w-4 h-4 text-primary" />
                          )}
                          {tab.type === "local" && (
                            <Database className="w-4 h-4 text-secondary" />
                          )}
                          {tab.type === "hybrid" && (
                            <Link className="w-4 h-4 text-accent" />
                          )}
                          <span className="font-semibold text-sm">
                            {tab.title}
                          </span>
                        </div>
                        {tab.isActive && (
                          <span className="badge badge-primary badge-xs">
                            アクティブ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-base-content/70 truncate">
                        {tab.url}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Web統合機能 */}
              <div>
                <h3 className="font-semibold mb-3">アクティブな統合機能</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {webIntegrations.map((integration) => (
                    <div
                      key={integration.title}
                      className="bg-base-300 p-4 rounded-lg border border-primary/10"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {integration.type === "search" && (
                            <Search className="w-4 h-4 text-primary" />
                          )}
                          {integration.type === "web-app" && (
                            <Globe className="w-4 h-4 text-primary" />
                          )}
                          {integration.type === "data-sync" && (
                            <Database className="w-4 h-4 text-primary" />
                          )}
                          <h3 className="font-semibold text-sm">
                            {integration.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {integration.tabs && (
                            <span className="badge badge-secondary badge-xs">
                              {integration.tabs} tabs
                            </span>
                          )}
                          <div
                            className={`w-2 h-2 rounded-full ${
                              integration.status === "active"
                                ? "bg-success"
                                : "bg-base-content/30"
                            }`}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-base-content/70 mb-2">
                        {integration.description}
                      </p>
                      {integration.url && (
                        <p className="text-xs text-primary truncate">
                          {integration.url}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* コンパクトダッシュボード */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 最近のワークフロー */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    最近のワークフロー
                  </h2>
                  <button className="btn btn-ghost btn-sm hover:bg-primary/10">
                    すべて表示
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {recentWorkflows.map((workflow) => {
                    const StatusIcon = getStatusIcon(workflow.status);
                    return (
                      <div
                        key={workflow.id}
                        className="bg-base-300 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">
                              {workflow.name}
                            </h3>
                            <p className="text-xs text-base-content/70">
                              {workflow.description}
                            </p>
                          </div>
                          <StatusIcon
                            className={`w-4 h-4 ml-2 ${
                              getStatusColor(workflow.status)
                            }`}
                          />
                        </div>
                        <div className="flex justify-between items-center text-xs text-base-content/60">
                          <span>
                            最終実行:{" "}
                            {workflow.lastRun.toLocaleString("ja-JP", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {workflow.nextRun && (
                            <span>
                              次回:{" "}
                              {workflow.nextRun.toLocaleTimeString("ja-JP", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sapphillon ステータス */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body p-4">
                <h2 className="card-title mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Sapphillon ステータス
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {sapphillonComponents.map((component) => {
                    const IconComponent = component.icon;
                    const StatusIcon = getStatusIcon(component.status);
                    return (
                      <div
                        key={component.name}
                        className="bg-base-300 p-3 rounded-lg border border-primary/10"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-sm">
                            {component.name}
                          </span>
                          <StatusIcon
                            className={`w-3 h-3 ml-auto ${
                              getStatusColor(component.status)
                            }`}
                          />
                        </div>
                        <p className="text-xs text-base-content/70 mb-1">
                          {component.description}
                        </p>
                        <p className="text-xs text-base-content/50">
                          {component.metrics}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="btn btn-outline btn-primary h-16 flex-col gap-1">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">AI相談</span>
            </button>
            <button className="btn btn-outline btn-secondary h-16 flex-col gap-1">
              <Zap className="w-5 h-5" />
              <span className="text-xs">自動化作成</span>
            </button>
            <button className="btn btn-outline btn-primary h-16 flex-col gap-1">
              <Search className="w-5 h-5" />
              <span className="text-xs">統合検索</span>
            </button>
            <button className="btn btn-outline btn-accent h-16 flex-col gap-1">
              <Globe className="w-5 h-5" />
              <span className="text-xs">Web統合</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
