import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Edit,
  Filter,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Upload,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { Button } from "../components/common/button.tsx";
import { Input } from "../components/common/input.tsx";
import { Card } from "../components/common/card.tsx";
import {
  NodeStatus,
  Workflow,
  WorkflowConnection,
  WorkflowNode,
} from "../types/workflow.ts";

export function WorkflowPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "completed" | "error"
  >("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "1",
      name: "ファイル整理ワークフロー",
      description:
        "デスクトップとダウンロードフォルダの画像ファイルを自動的に整理します",
      nodes: [
        {
          id: "1",
          label: "ファイル検索",
          type: "plugin",
          status: "completed",
          description: "ファイルマネージャープラグインでファイルを検索",
        },
        {
          id: "2",
          label: "ファイル種別判定",
          type: "plugin",
          status: "completed",
          description: "ファイルマネージャープラグインでファイルの種類を判定",
        },
        {
          id: "3",
          label: "フォルダ作成",
          type: "plugin",
          status: "completed",
          description: "ファイルマネージャープラグインで整理用フォルダを作成",
        },
        {
          id: "4",
          label: "ファイル移動",
          type: "plugin",
          status: "completed",
          description: "ファイルマネージャープラグインでファイルを移動",
        },
      ],
      connections: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
      ],
      generationState: {
        currentStep: 4,
        status: "completed",
        isActive: false,
        lastUpdated: new Date(Date.now() - 3600000),
      },
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      name: "ニュース要約ワークフロー",
      description: "複数のニュースサイトから最新情報を取得し、AI で要約します",
      nodes: [
        {
          id: "1",
          label: "ニュースサイト接続",
          type: "plugin",
          status: "active",
          description:
            "Web スクレイピング by Browser プラグインでニュースサイトに接続",
        },
        {
          id: "2",
          label: "記事取得",
          type: "plugin",
          status: "pending",
          description:
            "Web スクレイピング by Browser プラグインで最新記事を取得",
        },
        {
          id: "3",
          label: "LLM要約",
          type: "llm",
          status: "pending",
          description: "ローカル LLM で記事を要約",
        },
        {
          id: "4",
          label: "レポート生成",
          type: "plugin",
          status: "pending",
          description: "ファイルマネージャープラグインでレポートファイルを生成",
        },
      ],
      connections: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
      ],
      generationState: {
        currentStep: 1,
        status: "running",
        isActive: true,
        lastUpdated: new Date(Date.now() - 300000),
      },
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date(Date.now() - 300000),
    },
    {
      id: "3",
      name: "メール自動返信ワークフロー",
      description: "重要なメールを自動的に分類し、定型的な返信を送信します",
      nodes: [
        {
          id: "1",
          label: "メール受信",
          type: "plugin",
          status: "error",
          hasError: true,
          description: "メール操作プラグインで新しいメールを受信",
        },
        {
          id: "2",
          label: "重要度判定",
          type: "llm",
          status: "pending",
          description: "ローカル LLM でメールの重要度を判定",
        },
        {
          id: "3",
          label: "自動返信生成",
          type: "llm",
          status: "pending",
          description: "ローカル LLM で適切な返信を生成",
        },
        {
          id: "4",
          label: "返信送信",
          type: "plugin",
          status: "pending",
          description: "メール操作プラグインで返信を送信",
        },
      ],
      connections: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
      ],
      generationState: {
        currentStep: 1,
        status: "completed",
        isActive: false,
        lastUpdated: new Date(Date.now() - 1800000),
      },
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 1800000),
    },
    {
      id: "4",
      name: "場所情報調査ワークフロー",
      description:
        "Google Map プラグインを使用して指定された場所の詳細情報を調査します",
      nodes: [
        {
          id: "1",
          label: "場所検索",
          type: "plugin",
          status: "completed",
          description: "Google Map プラグインで場所を検索",
        },
        {
          id: "2",
          label: "詳細情報取得",
          type: "plugin",
          status: "completed",
          description: "Google Map プラグインで詳細情報を取得",
        },
        {
          id: "3",
          label: "情報整理",
          type: "llm",
          status: "completed",
          description: "ローカル LLM で取得した情報を整理",
        },
        {
          id: "4",
          label: "レポート保存",
          type: "plugin",
          status: "completed",
          description: "ファイルマネージャープラグインでレポートを保存",
        },
      ],
      connections: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
      ],
      generationState: {
        currentStep: 4,
        status: "completed",
        isActive: false,
        lastUpdated: new Date(Date.now() - 7200000),
      },
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 7200000),
    },
    {
      id: "5",
      name: "システム監視・通知ワークフロー",
      description: "システムの状態を監視し、異常があればメールで通知します",
      nodes: [
        {
          id: "1",
          label: "システム状態取得",
          type: "plugin",
          status: "active",
          description: "システム監視プラグインで現在の状態を取得",
        },
        {
          id: "2",
          label: "異常検知",
          type: "llm",
          status: "pending",
          description: "ローカル LLM で異常を検知・分析",
        },
        {
          id: "3",
          label: "通知メール作成",
          type: "llm",
          status: "pending",
          description: "ローカル LLM で通知メールを作成",
        },
        {
          id: "4",
          label: "メール送信",
          type: "plugin",
          status: "pending",
          description: "メール操作プラグインで通知メールを送信",
        },
      ],
      connections: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
      ],
      generationState: {
        currentStep: 1,
        status: "running",
        isActive: true,
        lastUpdated: new Date(Date.now() - 600000),
      },
      createdAt: new Date(Date.now() - 345600000),
      updatedAt: new Date(Date.now() - 600000),
    },
  ]);

  const getStatusIcon = (status: NodeStatus | undefined) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "active":
        return (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      case "error":
        return <AlertCircle className="w-4 h-4 text-error" />;
      default:
        return <Clock className="w-4 h-4 text-base-content/50" />;
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case "plugin":
        return "🔌";
      case "llm":
        return "🧠";
      default:
        return "📋";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <span className="badge badge-primary badge-sm">実行中</span>;
      case "completed":
        return <span className="badge badge-success badge-sm">完了</span>;
      case "error":
        return <span className="badge badge-error badge-sm">エラー</span>;
      default:
        return <span className="badge badge-ghost badge-sm">待機中</span>;
    }
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" ||
      workflow.generationState.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateWorkflow = () => {
    // TODO: Implement workflow creation
    console.log("Create new workflow");
  };

  const handleRunWorkflow = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? {
            ...w,
            generationState: {
              ...w.generationState,
              status: "running",
              isActive: true,
              lastUpdated: new Date(),
            },
          }
          : w
      )
    );
  };

  const handleStopWorkflow = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? {
            ...w,
            generationState: {
              ...w.generationState,
              status: "completed",
              isActive: false,
              lastUpdated: new Date(),
            },
          }
          : w
      )
    );
  };

  return (
    <div className="min-h-screen z-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-base-content mb-3">
              ワークフロー管理
            </h1>
            <p className="text-lg text-base-content font-medium">
              AI で生成されたワークフローを管理・実行できます
            </p>
          </div>
          <Button
            onClick={handleCreateWorkflow}
            variant="primary"
            className="flex items-center space-x-2 max-w-40"
          >
            <Plus className="w-4 h-4" />
            <span>新規作成</span>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <Input
              type="text"
              placeholder="ワークフローを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-base-content/50" />
            <select
              className="select select-bordered select-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">すべて</option>
              <option value="running">実行中</option>
              <option value="completed">完了</option>
              <option value="error">エラー</option>
            </select>
          </div>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="group p-0 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 border-base-300/30 bg-gradient-to-br from-base-100 to-base-200/50"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-lg">
                      <WorkflowIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors duration-200">
                        {workflow.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(workflow.generationState.status)}
                      </div>
                    </div>
                  </div>
                  <div className="dropdown dropdown-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      tabIndex={0}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-base-content/80 leading-relaxed mb-4">
                  {workflow.description}
                </p>
              </div>

              {/* Steps Section */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-base-content/70">
                    ステップ ({workflow.nodes.length})
                  </div>
                  {workflow.generationState.status === "running" && (
                    <div className="text-xs text-primary font-medium">
                      {workflow.generationState.currentStep}/{workflow.nodes
                        .length}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {workflow.nodes.slice(0, 3).map((node, index) => (
                    <div
                      key={node.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        node.status === "completed"
                          ? "bg-success/10 border border-success/20"
                          : node.status === "active"
                          ? "bg-primary/10 border border-primary/20"
                          : node.status === "error"
                          ? "bg-error/10 border border-error/20"
                          : "bg-base-200/50 border border-base-300/30"
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-xs font-medium text-base-content/50 w-4">
                          {index + 1}.
                        </span>
                        <span className="text-lg">
                          {getNodeTypeIcon(node.type)}
                        </span>
                        <span className="text-sm font-medium text-base-content flex-1">
                          {node.label}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusIcon(node.status)}
                      </div>
                    </div>
                  ))}
                  {workflow.nodes.length > 3 && (
                    <div className="text-xs text-base-content/50 pl-6 py-2">
                      +{workflow.nodes.length - 3} その他のステップ
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {workflow.generationState.status === "running" && (
                <div className="px-6 pb-4">
                  <div className="w-full bg-base-300/30 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                      style={{
                        width: `${
                          (workflow.generationState.currentStep /
                            workflow.nodes.length) * 100
                        }%`,
                      }}
                    >
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 bg-base-200/30 border-t border-base-300/30">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-base-content/60 font-medium">
                    更新: {workflow.updatedAt.toLocaleDateString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    {workflow.generationState.isActive
                      ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStopWorkflow(workflow.id)}
                          className="w-8 h-8 p-0 hover:bg-error/10 hover:text-error"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )
                      : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunWorkflow(workflow.id)}
                          className="w-8 h-8 p-0 hover:bg-success/10 hover:text-success"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 hover:bg-info/10 hover:text-info"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 hover:bg-error/10 hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredWorkflows.length === 0 && (
          <Card className="p-16 text-center bg-gradient-to-br from-base-100 to-base-200/50 border-2 border-base-300/30">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <WorkflowIcon className="w-12 h-12 text-primary/60" />
            </div>
            <h3 className="text-2xl font-bold text-base-content mb-3">
              {searchQuery || filterStatus !== "all"
                ? "ワークフローが見つかりません"
                : "まだワークフローがありません"}
            </h3>
            <p className="text-base-content/70 mb-6 text-lg max-w-md mx-auto">
              {searchQuery || filterStatus !== "all"
                ? "検索条件を変更してお試しください"
                : "新しいワークフローを作成して自動化を始めましょう"}
            </p>
            {(!searchQuery && filterStatus === "all") && (
              <Button
                onClick={handleCreateWorkflow}
                variant="primary"
                className="px-8 py-3 rounded-xl font-semibold text-lg shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                最初のワークフローを作成
              </Button>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-2">
          <Button
            variant="light"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>インポート</span>
          </Button>
          <Button
            variant="light"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>エクスポート</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
