import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Eye,
  Globe,
  MessageCircle,
  Network,
  Pause,
  Play,
  RefreshCw,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";

interface SapphillonComponent {
  id: string;
  name: string;
  type: "controller" | "automator" | "worker" | "language-engine";
  status: "healthy" | "warning" | "error" | "maintenance";
  description: string;
  icon: React.ElementType;
  metrics: {
    uptime: string;
    throughput: string;
    memory: number;
    cpu: number;
    connections?: number;
    tasks?: number;
    models?: string[];
    lastActivity: Date;
  };
  logs: ComponentLog[];
}

interface ComponentLog {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error";
  message: string;
  component: string;
}

interface WorkflowMetrics {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  activeWorkflows: number;
  queuedTasks: number;
}

interface WebIntegrationMetrics {
  connectedTabs: number;
  webAppsRunning: number;
  apiCalls: number;
  dataTransfer: string;
}

export function SystemMonitor() {
  const [components, setComponents] = useState<SapphillonComponent[]>([
    {
      id: "controller",
      name: "Controller",
      type: "controller",
      status: "healthy",
      description:
        "Floorp OS の中央制御システム。全てのコンポーネントとプラグインを管理。",
      icon: Activity,
      metrics: {
        uptime: "3h 45m",
        throughput: "1.2k ops/min",
        memory: 512,
        cpu: 15,
        tasks: 156,
        connections: 4,
        lastActivity: new Date(Date.now() - 30000),
      },
      logs: [
        {
          id: "log1",
          timestamp: new Date(Date.now() - 60000),
          level: "info",
          message: 'Workflow "メール整理" completed successfully',
          component: "controller",
        },
        {
          id: "log2",
          timestamp: new Date(Date.now() - 120000),
          level: "info",
          message: 'New plugin "GitHub Sync" registered',
          component: "controller",
        },
      ],
    },
    {
      id: "language-engine",
      name: "Language Engine",
      type: "language-engine",
      status: "healthy",
      description:
        "ローカルLLMエンジン。自然言語処理とワークフロー生成を担当。",
      icon: Brain,
      metrics: {
        uptime: "3h 45m",
        throughput: "45 tokens/sec",
        memory: 2100,
        cpu: 35,
        models: ["Gemma 2B", "Llama 7B"],
        lastActivity: new Date(Date.now() - 15000),
      },
      logs: [
        {
          id: "log3",
          timestamp: new Date(Date.now() - 45000),
          level: "info",
          message: 'Natural language command processed: "メール分類"',
          component: "language-engine",
        },
        {
          id: "log4",
          timestamp: new Date(Date.now() - 90000),
          level: "info",
          message: "Model Gemma 2B loaded successfully",
          component: "language-engine",
        },
      ],
    },
    {
      id: "automator",
      name: "Automator",
      type: "automator",
      status: "healthy",
      description:
        "ワークフロー実行エンジン。Denoベースのカスタムランタイムで自動化を実行。",
      icon: Zap,
      metrics: {
        uptime: "3h 45m",
        throughput: "23 workflows/hour",
        memory: 890,
        cpu: 20,
        tasks: 3,
        lastActivity: new Date(Date.now() - 5000),
      },
      logs: [
        {
          id: "log5",
          timestamp: new Date(Date.now() - 30000),
          level: "info",
          message: "Workflow execution: Email classification started",
          component: "automator",
        },
        {
          id: "log6",
          timestamp: new Date(Date.now() - 180000),
          level: "info",
          message: 'Scheduled task "Data backup" queued',
          component: "automator",
        },
      ],
    },
    {
      id: "worker",
      name: "Worker",
      type: "worker",
      status: "healthy",
      description:
        "Floorp ブラウザとの統合インターフェース。WebとOSの橋渡しを行う。",
      icon: Globe,
      metrics: {
        uptime: "3h 45m",
        throughput: "2.8k requests/min",
        memory: 645,
        cpu: 12,
        connections: 12,
        lastActivity: new Date(Date.now() - 10000),
      },
      logs: [
        {
          id: "log7",
          timestamp: new Date(Date.now() - 20000),
          level: "info",
          message: "New browser tab connected: github.com",
          component: "worker",
        },
        {
          id: "log8",
          timestamp: new Date(Date.now() - 75000),
          level: "info",
          message: "Web API call successful: DuckDuckGo search",
          component: "worker",
        },
      ],
    },
  ]);

  const [workflowMetrics] = useState<WorkflowMetrics>({
    totalExecutions: 1247,
    successRate: 94.2,
    averageExecutionTime: 3.4,
    activeWorkflows: 3,
    queuedTasks: 7,
  });

  const [webMetrics] = useState<WebIntegrationMetrics>({
    connectedTabs: 12,
    webAppsRunning: 5,
    apiCalls: 2834,
    dataTransfer: "15.2 MB",
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string>(
    "controller",
  );

  // リアルタイムメトリクス更新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setComponents((prev) =>
        prev.map((comp) => ({
          ...comp,
          metrics: {
            ...comp.metrics,
            cpu: Math.max(
              5,
              Math.min(80, comp.metrics.cpu + (Math.random() - 0.5) * 10),
            ),
            memory: Math.max(
              100,
              comp.metrics.memory + (Math.random() - 0.5) * 50,
            ),
            lastActivity: new Date(),
          },
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: SapphillonComponent["status"]) => {
    switch (status) {
      case "healthy":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-error";
      case "maintenance":
        return "text-info";
      default:
        return "text-base-content";
    }
  };

  const getStatusIcon = (status: SapphillonComponent["status"]) => {
    switch (status) {
      case "healthy":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      case "maintenance":
        return Clock;
      default:
        return CheckCircle;
    }
  };

  const selectedComponentData = components.find((c) =>
    c.id === selectedComponent
  );

  return (
    <div className="h-full w-full p-6 bg-base-100 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Sapphillon 監視
            </h1>
            <p className="text-base-content/70 mt-1">
              Floorp OS コンポーネントのリアルタイム監視とパフォーマンス分析
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text mr-2">自動更新</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              </label>
            </div>
            <button className="btn btn-ghost btn-sm hover:bg-primary/10">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sapphillonコンポーネント概要 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {components.map((component) => {
            const IconComponent = component.icon;
            const StatusIcon = getStatusIcon(component.status);

            return (
              <div
                key={component.id}
                className={`card bg-base-200 shadow-lg cursor-pointer transition-all border border-primary/20 hover:border-primary/40 ${
                  selectedComponent === component.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => setSelectedComponent(component.id)}
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-sm">{component.name}</h3>
                    </div>
                    <StatusIcon
                      className={`w-4 h-4 ${getStatusColor(component.status)}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>CPU</span>
                      <span>{component.metrics.cpu}%</span>
                    </div>
                    <progress
                      className="progress progress-primary w-full h-2"
                      value={component.metrics.cpu}
                      max="100"
                    />

                    <div className="flex justify-between text-xs">
                      <span>メモリ</span>
                      <span>{component.metrics.memory}MB</span>
                    </div>
                    <progress
                      className="progress progress-secondary w-full h-2"
                      value={(component.metrics.memory / 4096) * 100}
                      max="100"
                    />
                  </div>

                  <div className="text-xs text-base-content/60 mt-2">
                    稼働時間: {component.metrics.uptime}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ワークフロー統計 */}
          <div className="card bg-base-200 shadow-lg border border-primary/20">
            <div className="card-body p-4">
              <h2 className="card-title text-lg mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                ワークフロー統計
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">総実行回数</span>
                  <span className="font-bold">
                    {workflowMetrics.totalExecutions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">成功率</span>
                  <span className="font-bold text-success">
                    {workflowMetrics.successRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">平均実行時間</span>
                  <span className="font-bold">
                    {workflowMetrics.averageExecutionTime}秒
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">実行中</span>
                  <span className="font-bold text-warning">
                    {workflowMetrics.activeWorkflows}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Web統合統計 */}
          <div className="card bg-base-200 shadow-lg border border-primary/20">
            <div className="card-body p-4">
              <h2 className="card-title text-lg mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Web統合統計
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">接続タブ</span>
                  <span className="font-bold">{webMetrics.connectedTabs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Webアプリ</span>
                  <span className="font-bold">{webMetrics.webAppsRunning}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">API呼び出し</span>
                  <span className="font-bold">
                    {webMetrics.apiCalls.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">データ転送</span>
                  <span className="font-bold">{webMetrics.dataTransfer}</span>
                </div>
              </div>
            </div>
          </div>

          {/* システム全体 */}
          <div className="card bg-base-200 shadow-lg border border-primary/20">
            <div className="card-body p-4">
              <h2 className="card-title text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                システム全体
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">全体CPU使用率</span>
                  <span className="font-bold">
                    {Math.round(
                      components.reduce((sum, c) => sum + c.metrics.cpu, 0) /
                        components.length,
                    )}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">全体メモリ使用量</span>
                  <span className="font-bold">
                    {Math.round(
                      components.reduce((sum, c) => sum + c.metrics.memory, 0),
                    )}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">稼働コンポーネント</span>
                  <span className="font-bold text-success">
                    {components.filter((c) => c.status === "healthy").length}/4
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">アクティブ接続</span>
                  <span className="font-bold">
                    {components.reduce(
                      (sum, c) => sum + (c.metrics.connections || 0),
                      0,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細情報 */}
        {selectedComponentData && (
          <div className="card bg-base-200 shadow-lg border border-primary/20">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <selectedComponentData.icon className="w-5 h-5 text-primary" />
                  {selectedComponentData.name} 詳細
                </h2>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm hover:bg-primary/10">
                    <Eye className="w-4 h-4" />
                    詳細表示
                  </button>
                  <button className="btn btn-ghost btn-sm hover:bg-primary/10">
                    <Settings className="w-4 h-4" />
                    設定
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* メトリクス */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">パフォーマンス</h3>
                  <div className="bg-base-300 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">スループット</span>
                        <span className="font-bold">
                          {selectedComponentData.metrics.throughput}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">CPU使用率</span>
                        <span className="font-bold">
                          {selectedComponentData.metrics.cpu}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">メモリ使用量</span>
                        <span className="font-bold">
                          {selectedComponentData.metrics.memory}MB
                        </span>
                      </div>
                      {selectedComponentData.metrics.tasks && (
                        <div className="flex justify-between">
                          <span className="text-sm">管理タスク</span>
                          <span className="font-bold">
                            {selectedComponentData.metrics.tasks}
                          </span>
                        </div>
                      )}
                      {selectedComponentData.metrics.connections && (
                        <div className="flex justify-between">
                          <span className="text-sm">アクティブ接続</span>
                          <span className="font-bold">
                            {selectedComponentData.metrics.connections}
                          </span>
                        </div>
                      )}
                      {selectedComponentData.metrics.models && (
                        <div>
                          <span className="text-sm">ロード済みモデル</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedComponentData.metrics.models.map((
                              model,
                            ) => (
                              <span
                                key={model}
                                className="badge badge-primary badge-sm"
                              >
                                {model}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ログ */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">最新ログ</h3>
                  <div className="bg-base-300 p-4 rounded-lg">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedComponentData.logs.map((log) => (
                        <div key={log.id} className="text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  log.level === "info"
                                    ? "bg-success"
                                    : log.level === "warning"
                                    ? "bg-warning"
                                    : "bg-error"
                                }`}
                              />
                              <span className="font-mono text-xs">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                log.level === "info"
                                  ? "bg-success/20 text-success"
                                  : log.level === "warning"
                                  ? "bg-warning/20 text-warning"
                                  : "bg-error/20 text-error"
                              }`}
                            >
                              {log.level}
                            </span>
                          </div>
                          <p className="text-base-content/70 mt-1">
                            {log.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 詳細説明 */}
              <div className="mt-6 p-4 bg-base-300 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">
                  コンポーネント説明
                </h3>
                <p className="text-sm text-base-content/70">
                  {selectedComponentData.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
