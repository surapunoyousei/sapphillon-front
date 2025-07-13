import { useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  FileText,
  Globe,
  Mail,
  Map,
  MoreVertical,
  Play,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "../components/common/button.tsx";
import { Card } from "../components/common/card.tsx";
import { WorkflowConnection, WorkflowNode } from "../types/workflow.ts";

interface WorkflowDetailProps {
  workflowId?: string;
}

interface FlowchartNode extends WorkflowNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function WorkflowDetailPage({ workflowId = "1" }: WorkflowDetailProps) {
  const [workflow] = useState({
    id: workflowId,
    name: "ファイル整理ワークフロー",
    description:
      "デスクトップとダウンロードフォルダの画像ファイルを自動的に整理します",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3600000),
    nodes: [
      {
        id: "1",
        label: "ファイル検索",
        type: "plugin" as const,
        status: "completed" as const,
        description: "デスクトップフォルダ内のファイルを検索します",
        pluginId: "file-manager",
        pluginIcon: "📁",
      },
      {
        id: "2",
        label: "ファイル種別判定",
        type: "plugin" as const,
        status: "completed" as const,
        description: "見つかったファイルの種類を判定します",
        pluginId: "file-manager",
        pluginIcon: "🔍",
      },
      {
        id: "3",
        label: "フォルダ作成",
        type: "plugin" as const,
        status: "completed" as const,
        description: "「整理済み画像」フォルダを作成します",
        pluginId: "file-manager",
        pluginIcon: "📂",
      },
      {
        id: "4",
        label: "ファイル移動",
        type: "plugin" as const,
        status: "completed" as const,
        description: "画像ファイルを整理フォルダに移動します",
        pluginId: "file-manager",
        pluginIcon: "📁",
      },
    ],
    connections: [
      { from: "1", to: "2" },
      { from: "2", to: "3" },
      { from: "3", to: "4" },
    ],
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // フローチャートのノード配置を計算
  const calculateNodePositions = (): FlowchartNode[] => {
    const nodeWidth = 200;
    const nodeHeight = 80;
    const horizontalSpacing = 100;
    const verticalSpacing = 120;
    const startX = 50;
    const startY = 50;

    return workflow.nodes.map((node, index) => ({
      ...node,
      x: startX + (index * (nodeWidth + horizontalSpacing)),
      y: startY,
      width: nodeWidth,
      height: nodeHeight,
    }));
  };

  const flowchartNodes = calculateNodePositions();

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "plugin":
        return <Zap className="w-4 h-4 text-primary" />;
      case "llm":
        return <Sparkles className="w-4 h-4 text-secondary" />;
      case "condition":
        return <Settings className="w-4 h-4 text-accent" />;
      default:
        return <FileText className="w-4 h-4 text-base-content" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-success/50 bg-success/10";
      case "active":
        return "border-primary/50 bg-primary/10";
      case "error":
        return "border-error/50 bg-error/10";
      default:
        return "border-base-300/50 bg-base-200/20";
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case "plugin":
        return "from-primary/20 to-primary/10";
      case "llm":
        return "from-secondary/20 to-secondary/10";
      case "condition":
        return "from-accent/20 to-accent/10";
      default:
        return "from-base-200/20 to-base-100/10";
    }
  };

  const selectedNode = selectedNodeId
    ? workflow.nodes.find((node) => node.id === selectedNodeId)
    : null;

  const handleRunWorkflow = () => {
    console.log("ワークフロー実行:", workflow.id);
    // TODO: 実行画面へナビゲート
  };

  const handleEditWorkflow = () => {
    setIsEditing(!isEditing);
  };

  const handleDuplicateWorkflow = () => {
    console.log("ワークフロー複製:", workflow.id);
  };

  const handleDeleteWorkflow = () => {
    console.log("ワークフロー削除:", workflow.id);
  };

  const canvasWidth = Math.max(800, flowchartNodes.length * 300);
  const canvasHeight = 400;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
              <Workflow className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content mb-1">
                {workflow.name}
              </h1>
              <p className="text-base-content/70">
                {workflow.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRunWorkflow}
              variant="primary"
              size="sm"
              className="px-6"
            >
              <Play className="w-4 h-4 mr-2" />
              実行
            </Button>
            <div className="dropdown dropdown-end">
              <Button
                variant="light"
                size="sm"
                className="w-10 h-10 p-0"
                tabIndex={0}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a onClick={handleEditWorkflow}>
                    <Edit className="w-4 h-4" />
                    編集
                  </a>
                </li>
                <li>
                  <a onClick={handleDuplicateWorkflow}>
                    <Copy className="w-4 h-4" />
                    複製
                  </a>
                </li>
                <li>
                  <a>
                    <Upload className="w-4 h-4" />
                    エクスポート
                  </a>
                </li>
                <li className="border-t border-base-300/30 mt-2 pt-2">
                  <a onClick={handleDeleteWorkflow} className="text-error">
                    <Trash2 className="w-4 h-4" />
                    削除
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* メタデータ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm font-medium text-base-content/70 mb-1">
              ステップ数
            </div>
            <div className="text-2xl font-bold text-base-content">
              {workflow.nodes.length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-base-content/70 mb-1">
              作成日
            </div>
            <div className="text-lg font-semibold text-base-content">
              {workflow.createdAt.toLocaleDateString("ja-JP")}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-base-content/70 mb-1">
              最終更新
            </div>
            <div className="text-lg font-semibold text-base-content">
              {workflow.updatedAt.toLocaleDateString("ja-JP")}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-base-content/70 mb-1">
              状態
            </div>
            <div className="text-lg font-semibold text-success">
              完了
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* フローチャート */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-base-content">
                  ワークフロー図
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-base-200/20 rounded-xl p-6 overflow-auto">
                <svg
                  width={canvasWidth}
                  height={canvasHeight}
                  className="border-2 border-dashed border-base-300/30 rounded-lg"
                >
                  {/* 接続線 */}
                  {workflow.connections.map((connection, index) => {
                    const fromNode = flowchartNodes.find((n) =>
                      n.id === connection.from
                    );
                    const toNode = flowchartNodes.find((n) =>
                      n.id === connection.to
                    );

                    if (!fromNode || !toNode) return null;

                    const fromX = fromNode.x + fromNode.width;
                    const fromY = fromNode.y + fromNode.height / 2;
                    const toX = toNode.x;
                    const toY = toNode.y + toNode.height / 2;

                    return (
                      <g key={index}>
                        <line
                          x1={fromX}
                          y1={fromY}
                          x2={toX}
                          y2={toY}
                          stroke="#94a3b8"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      </g>
                    );
                  })}

                  {/* 矢印マーカー */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#94a3b8"
                      />
                    </marker>
                  </defs>
                </svg>

                {/* ノード */}
                <div className="relative">
                  {flowchartNodes.map((node) => (
                    <div
                      key={node.id}
                      className={`absolute cursor-pointer transition-all duration-200 ${
                        selectedNodeId === node.id ? "scale-105" : ""
                      }`}
                      style={{
                        left: node.x,
                        top: node.y - canvasHeight + 100,
                        width: node.width,
                        height: node.height,
                      }}
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      <div
                        className={`w-full h-full rounded-xl border-2 shadow-lg p-4 backdrop-blur-sm transition-all duration-200 ${
                          getStatusColor(node.status || "pending")
                        } ${
                          selectedNodeId === node.id
                            ? "border-primary/80 shadow-xl"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {getNodeIcon(node.type)}
                          <span className="text-sm font-semibold text-base-content truncate">
                            {node.label}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/70 line-clamp-2">
                          {node.description}
                        </p>
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-base-200/60 text-base-content/70 rounded">
                            {node.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* ノード詳細 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-base-content">
                {selectedNode ? "ノード詳細" : "ノードを選択"}
              </h3>

              {selectedNode
                ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-base-200/30 rounded-xl">
                      <div className="flex items-center space-x-2 mb-3">
                        {getNodeIcon(selectedNode.type)}
                        <span className="font-semibold text-base-content">
                          {selectedNode.label}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/80 mb-3">
                        {selectedNode.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-base-content/70">タイプ:</span>
                          <span className="text-base-content">
                            {selectedNode.type}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-base-content/70">状態:</span>
                          <span className="text-base-content">
                            {selectedNode.status}
                          </span>
                        </div>
                        {selectedNode.pluginId && (
                          <div className="flex justify-between text-sm">
                            <span className="text-base-content/70">
                              プラグイン:
                            </span>
                            <span className="text-base-content">
                              {selectedNode.pluginId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="space-y-3">
                        <Button variant="light" size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          ノード編集
                        </Button>
                        <Button variant="light" size="sm" className="w-full">
                          <Copy className="w-4 h-4 mr-2" />
                          ノード複製
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="w-full text-error"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          ノード削除
                        </Button>
                      </div>
                    )}
                  </div>
                )
                : (
                  <div className="text-center py-8 text-base-content/50">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>フローチャートからノードを選択してください</p>
                  </div>
                )}
            </Card>

            {/* 実行統計 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-base-content">
                実行統計
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
                  <div className="text-sm font-medium text-success mb-1">
                    成功した実行
                  </div>
                  <div className="text-2xl font-bold text-success">23</div>
                </div>
                <div className="p-4 bg-error/5 border border-error/20 rounded-xl">
                  <div className="text-sm font-medium text-error mb-1">
                    失敗した実行
                  </div>
                  <div className="text-2xl font-bold text-error">2</div>
                </div>
                <div className="p-4 bg-info/5 border border-info/20 rounded-xl">
                  <div className="text-sm font-medium text-info mb-1">
                    平均実行時間
                  </div>
                  <div className="text-2xl font-bold text-info">4.2s</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
