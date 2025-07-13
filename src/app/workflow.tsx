import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Edit,
  Eye,
  FileText,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import {
  Workflow,
  WorkflowGenerationState,
  WorkflowNode,
} from "../types/workflow.ts";

export function WorkflowManager() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "wf-1",
      name: "ファイル整理自動化",
      description: "ダウンロードフォルダのファイルを種類別に自動整理",
      nodes: [
        {
          id: "n1",
          label: "ダウンロードフォルダ監視",
          type: "action",
          status: "completed",
        },
        {
          id: "n2",
          label: "ファイル種類判定",
          type: "condition",
          status: "completed",
        },
        { id: "n3", label: "フォルダ移動", type: "action", status: "active" },
      ],
      connections: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" },
      ],
      generationState: {
        currentStep: 2,
        status: "running",
        isActive: true,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "wf-2",
      name: "メール要約",
      description: "AI を使って新着メールを要約",
      nodes: [
        { id: "n1", label: "メール取得", type: "action", status: "completed" },
        { id: "n2", label: "AI要約", type: "llm", status: "completed" },
        { id: "n3", label: "通知送信", type: "action", status: "completed" },
      ],
      connections: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" },
      ],
      generationState: {
        currentStep: 3,
        status: "completed",
        isActive: false,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "wf-3",
      name: "Webスクレイピング",
      description: "ニュースサイトから記事を収集",
      nodes: [
        { id: "n1", label: "サイト接続", type: "action", status: "pending" },
        { id: "n2", label: "データ抽出", type: "plugin", status: "pending" },
        { id: "n3", label: "データ保存", type: "action", status: "pending" },
      ],
      connections: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" },
      ],
      generationState: {
        currentStep: 0,
        status: "pending",
        isActive: false,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowPrompt, setNewWorkflowPrompt] = useState("");

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "running":
        return "text-warning";
      case "pending":
        return "text-info";
      case "error":
        return "text-error";
      default:
        return "text-base-content";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "running":
        return Loader2;
      case "pending":
        return Clock;
      case "error":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const handleCreateWorkflow = () => {
    if (newWorkflowPrompt.trim()) {
      console.log("Creating workflow:", newWorkflowPrompt);
      setIsCreating(false);
      setNewWorkflowPrompt("");
      // ここで実際のワークフロー生成ロジックを実装
    }
  };

  const handleWorkflowAction = (
    workflowId: string,
    action: "play" | "pause" | "stop",
  ) => {
    console.log(`${action} workflow:`, workflowId);
    // ここで実際のワークフロー制御ロジックを実装
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">ワークフロー管理</h1>
          <p className="text-base-content/70 mt-1">
            AIと自然言語を使った自動化タスクの管理
          </p>
        </div>
        <button
          className="btn btn-primary gap-2"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="w-5 h-5" />
          新規ワークフロー
        </button>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stats shadow bg-base-200 border border-primary/20">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <div className="stat-title text-sm">アクティブ</div>
            <div className="stat-value text-2xl text-primary">
              {workflows.filter((w) => w.generationState.status === "running")
                .length}
            </div>
          </div>
        </div>

        <div className="stats shadow bg-base-200 border border-primary/20">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="stat-title text-sm">スケジュール済み</div>
            <div className="stat-value text-2xl text-secondary">
              {workflows.filter((w) => w.generationState.status === "completed")
                .length}
            </div>
          </div>
        </div>

        <div className="stats shadow bg-base-200 border border-primary/20">
          <div className="stat">
            <div className="stat-figure text-success">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-title text-sm">成功率</div>
            <div className="stat-value text-2xl text-success">
              {Math.round(
                (workflows.filter((w) =>
                  w.generationState.status === "completed"
                ).length / workflows.length) * 100,
              )}%
            </div>
          </div>
        </div>

        <div className="stats shadow bg-base-200 border border-primary/20">
          <div className="stat">
            <div className="stat-figure text-accent">
              <Bot className="w-6 h-6" />
            </div>
            <div className="stat-title text-sm">AI統合</div>
            <div className="stat-value text-2xl text-accent">
              {workflows.filter((w) => w.nodes.some((n) => n.type === "llm"))
                .length}
            </div>
          </div>
        </div>
      </div>

      {/* ワークフロー作成フォーム */}
      {isCreating && (
        <div className="card bg-base-200 shadow-lg mb-8 border border-primary/20">
          <div className="card-body">
            <h2 className="card-title text-primary">新しいワークフロー作成</h2>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    ワークフロー名
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full focus:border-primary"
                  value={newWorkflowPrompt}
                  onChange={(e) => setNewWorkflowPrompt(e.target.value)}
                  placeholder="例: ファイル整理自動化"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">説明</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full focus:border-primary"
                  value={newWorkflowPrompt}
                  onChange={(e) => setNewWorkflowPrompt(e.target.value)}
                  placeholder="ワークフローの目的と動作を説明してください"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-primary"
                onClick={handleCreateWorkflow}
              >
                作成
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setIsCreating(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ワークフロー一覧 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredWorkflows.map((workflow) => {
          const StatusIcon = getStatusIcon(workflow.generationState.status);
          const completedNodes = workflow.nodes.filter((node) =>
            node.status === "completed"
          ).length;
          const totalNodes = workflow.nodes.length;
          const progress = (completedNodes / totalNodes) * 100;

          return (
            <div
              key={workflow.id}
              className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow border border-primary/20"
            >
              <div className="card-body p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="card-title text-primary">
                        {workflow.name}
                      </h3>
                      <span
                        className={`badge ${
                          getStatusColor(workflow.generationState.status)
                        }`}
                      >
                        {workflow.generationState.status}
                      </span>
                    </div>
                    <p className="text-base-content/70 mb-3">
                      {workflow.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {workflow.nodes.slice(0, 3).map((node) => {
                        const NodeStatusIcon = getStatusIcon(
                          node.status || "pending",
                        );
                        return (
                          <span
                            key={node.id}
                            className="badge badge-primary badge-outline"
                          >
                            {node.label}
                          </span>
                        );
                      })}
                      {workflow.nodes.length > 3 && (
                        <span className="badge badge-primary badge-outline">
                          +{workflow.nodes.length - 3} more...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleWorkflowAction(workflow.id, "play")}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    {workflow.generationState.status === "running" && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() =>
                          handleWorkflowAction(workflow.id, "pause")}
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedWorkflow(workflow.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <div className="dropdown dropdown-end">
                      <button tabIndex={0} className="btn btn-ghost btn-sm">
                        <Settings className="w-4 h-4" />
                      </button>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                      >
                        <li>
                          <a>
                            <Edit className="w-4 h-4" />編集
                          </a>
                        </li>
                        <li>
                          <a>
                            <Copy className="w-4 h-4" />複製
                          </a>
                        </li>
                        <li>
                          <a>
                            <Download className="w-4 h-4" />エクスポート
                          </a>
                        </li>
                        <li>
                          <a className="text-error">
                            <Trash2 className="w-4 h-4" />削除
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-base-content/70">
                      最終更新: {workflow.updatedAt.toLocaleString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-base-content/70">
                      進捗: {completedNodes}/{totalNodes}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <progress
                      className="progress progress-primary w-full"
                      value={progress}
                      max="100"
                    >
                    </progress>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {workflow.generationState.status === "completed"
                      ? <CheckCircle className="w-4 h-4 text-success" />
                      : <AlertTriangle className="w-4 h-4 text-error" />}
                    <span
                      className={`text-sm ${
                        workflow.generationState.status === "completed"
                          ? "text-success"
                          : "text-error"
                      }`}
                    >
                      {workflow.generationState.status === "completed"
                        ? "正常実行"
                        : "要確認"}
                    </span>
                  </div>

                  <button className="btn btn-outline btn-sm">
                    <Settings className="w-4 h-4" />
                    設定
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
