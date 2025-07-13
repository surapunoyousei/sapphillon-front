import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Code,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Globe,
  Info,
  Package,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  Upload,
  Users,
  Zap,
} from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: "automation" | "system" | "web" | "ai" | "utility";
  status: "installed" | "available" | "updating" | "disabled";
  rating: number;
  downloads: number;
  verified: boolean;
  lastUpdated: Date;
  permissions: string[];
  icon?: string;
  screenshots?: string[];
}

interface PluginKit {
  id: string;
  name: string;
  type: "Plugin Kit" | "Tool Kit" | "Schedule Kit";
  description: string;
  functions: string[];
  examples: string[];
}

export function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: "floorp-search",
      name: "Floorp Search",
      version: "1.2.0",
      description: "ウェブとローカルファイルを横断する統合検索エンジン",
      author: "Floorp Team",
      category: "web",
      status: "installed",
      rating: 4.8,
      downloads: 15420,
      verified: true,
      lastUpdated: new Date("2024-01-15"),
      permissions: ["ファイルアクセス", "ネットワーク"],
    },
    {
      id: "ai-assistant",
      name: "AI Assistant",
      version: "2.1.0",
      description: "ローカルLLMを使用した自然言語処理アシスタント",
      author: "Sapphillon",
      category: "ai",
      status: "installed",
      rating: 4.9,
      downloads: 8932,
      verified: true,
      lastUpdated: new Date("2024-01-10"),
      permissions: ["AIモデルアクセス", "ユーザーデータ"],
    },
    {
      id: "file-organizer",
      name: "File Organizer",
      version: "1.0.5",
      description: "ファイルの自動整理とカテゴリー分類",
      author: "DevCommunity",
      category: "utility",
      status: "installed",
      rating: 4.3,
      downloads: 12456,
      verified: true,
      lastUpdated: new Date("2024-01-08"),
      permissions: ["ファイルアクセス", "ファイル操作"],
    },
    {
      id: "web-scraper",
      name: "Web Scraper Pro",
      version: "3.0.2",
      description: "Webサイトからデータを抽出し、構造化データに変換",
      author: "WebTools Inc.",
      category: "web",
      status: "available",
      rating: 4.5,
      downloads: 6789,
      verified: true,
      lastUpdated: new Date("2024-01-12"),
      permissions: ["ネットワーク", "データ保存"],
    },
    {
      id: "system-monitor",
      name: "Advanced System Monitor",
      version: "1.5.1",
      description: "システムリソースの詳細監視とアラート機能",
      author: "SystemUtils",
      category: "system",
      status: "available",
      rating: 4.6,
      downloads: 9876,
      verified: true,
      lastUpdated: new Date("2024-01-14"),
      permissions: ["システムアクセス", "プロセス管理"],
    },
    {
      id: "beta-automation",
      name: "Beta Automation Suite",
      version: "0.8.0",
      description: "ベータ版: 高度な自動化ワークフロー（実験的機能）",
      author: "AutomationLabs",
      category: "automation",
      status: "available",
      rating: 3.9,
      downloads: 1234,
      verified: false,
      lastUpdated: new Date("2024-01-16"),
      permissions: ["システムアクセス", "ファイル操作", "ネットワーク"],
    },
  ]);

  const [pluginKits] = useState<PluginKit[]>([
    {
      id: "web-kit",
      name: "Web Browser Kit",
      type: "Tool Kit",
      description: "ウェブブラウザの操作機能を提供",
      functions: [
        "tab.open()",
        "tab.close()",
        "page.screenshot()",
        "element.click()",
      ],
      examples: [
        "タブの管理",
        "ページのスクリーンショット",
        "フォーム入力の自動化",
      ],
    },
    {
      id: "file-kit",
      name: "File System Kit",
      type: "Tool Kit",
      description: "ファイルシステムの操作機能を提供",
      functions: ["file.read()", "file.write()", "dir.create()", "file.move()"],
      examples: [
        "ファイルの読み書き",
        "ディレクトリの作成",
        "ファイルの移動・コピー",
      ],
    },
    {
      id: "schedule-kit",
      name: "Task Scheduler Kit",
      type: "Schedule Kit",
      description: "ワークフローの定期実行機能を提供",
      functions: ["schedule.cron()", "schedule.interval()", "schedule.once()"],
      examples: ["定期的なバックアップ", "システムメンテナンス", "データ同期"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [activeTab, setActiveTab] = useState<"plugins" | "kits">("plugins");

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" ||
      plugin.category === categoryFilter;
    const matchesStatus = statusFilter === "all" ||
      plugin.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: Plugin["status"]) => {
    switch (status) {
      case "installed":
        return "text-success";
      case "available":
        return "text-info";
      case "updating":
        return "text-warning";
      case "disabled":
        return "text-error";
      default:
        return "text-base-content";
    }
  };

  const getStatusIcon = (status: Plugin["status"]) => {
    switch (status) {
      case "installed":
        return CheckCircle;
      case "available":
        return Download;
      case "updating":
        return RotateCcw;
      case "disabled":
        return AlertTriangle;
      default:
        return Package;
    }
  };

  const getCategoryIcon = (category: Plugin["category"]) => {
    switch (category) {
      case "automation":
        return Zap;
      case "system":
        return Settings;
      case "web":
        return Globe;
      case "ai":
        return Code;
      case "utility":
        return Package;
      default:
        return Package;
    }
  };

  const handlePluginAction = (
    plugin: Plugin,
    action: "install" | "uninstall" | "enable" | "disable" | "update",
  ) => {
    console.log(`${action} plugin:`, plugin.id);
    // 実際のプラグイン操作ロジックを実装
  };

  return (
    <div className="h-full w-full p-6 bg-base-100 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              プラグイン管理
            </h1>
            <p className="text-base-content/70 mt-1">
              Floorp OS の機能を拡張するプラグインの管理
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline">
              <Upload className="w-4 h-4" />
              インストール
            </button>
            <button className="btn btn-primary">
              <Package className="w-4 h-4" />
              ストア
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="tabs tabs-boxed">
          <a
            className={`tab ${activeTab === "plugins" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("plugins")}
          >
            <Package className="w-4 h-4 mr-2" />
            プラグイン
          </a>
          <a
            className={`tab ${activeTab === "kits" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("kits")}
          >
            <Code className="w-4 h-4 mr-2" />
            開発キット
          </a>
        </div>

        {activeTab === "plugins" && (
          <>
            {/* 検索とフィルター */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
                    <input
                      type="text"
                      placeholder="プラグインを検索..."
                      className="input input-bordered w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="select select-bordered"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">すべてのカテゴリ</option>
                    <option value="automation">自動化</option>
                    <option value="system">システム</option>
                    <option value="web">ウェブ</option>
                    <option value="ai">AI</option>
                    <option value="utility">ユーティリティ</option>
                  </select>
                  <select
                    className="select select-bordered"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">すべてのステータス</option>
                    <option value="installed">インストール済み</option>
                    <option value="available">利用可能</option>
                    <option value="updating">更新中</option>
                    <option value="disabled">無効</option>
                  </select>
                </div>
              </div>
            </div>

            {/* プラグイン一覧 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPlugins.map((plugin) => {
                const StatusIcon = getStatusIcon(plugin.status);
                const CategoryIcon = getCategoryIcon(plugin.category);

                return (
                  <div
                    key={plugin.id}
                    className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-base-300 rounded-lg">
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{plugin.name}</h3>
                            <p className="text-sm text-base-content/70">
                              v{plugin.version}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {plugin.verified && (
                            <Shield className="w-4 h-4 text-success" />
                          )}
                          <StatusIcon
                            className={`w-4 h-4 ${
                              getStatusColor(plugin.status)
                            }`}
                          />
                        </div>
                      </div>

                      <p className="text-sm text-base-content/80 mb-3 line-clamp-3">
                        {plugin.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-base-content/70 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {plugin.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {plugin.downloads.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-base-content/50 mb-4">
                        <span>{plugin.author}</span>
                        <span>
                          {plugin.lastUpdated.toLocaleDateString("ja-JP")}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {plugin.status === "installed"
                          ? (
                            <>
                              <button
                                className="btn btn-ghost btn-sm flex-1"
                                onClick={() =>
                                  handlePluginAction(plugin, "disable")}
                              >
                                <Pause className="w-4 h-4" />
                                無効化
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setSelectedPlugin(plugin)}
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                            </>
                          )
                          : (
                            <button
                              className="btn btn-primary btn-sm flex-1"
                              onClick={() =>
                                handlePluginAction(plugin, "install")}
                            >
                              <Download className="w-4 h-4" />
                              インストール
                            </button>
                          )}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedPlugin(plugin)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "kits" && (
          <div className="space-y-6">
            <div className="alert alert-info">
              <Info className="w-5 h-5" />
              <div>
                <div className="font-bold">開発キットについて</div>
                <div className="text-sm">
                  開発キットは、プラグインやワークフローの開発に使用するツールセットです。
                  これらのキットを使用して、カスタムプラグインを作成できます。
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pluginKits.map((kit) => (
                <div key={kit.id} className="card bg-base-200 shadow-lg">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-base-300 rounded-lg">
                        <Code className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{kit.name}</h3>
                        <span className="badge badge-sm badge-outline">
                          {kit.type}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-base-content/80 mb-4">
                      {kit.description}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          提供機能:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {kit.functions.map((func) => (
                            <span
                              key={func}
                              className="badge badge-ghost badge-sm"
                            >
                              {func}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">使用例:</h4>
                        <ul className="text-sm text-base-content/70 space-y-1">
                          {kit.examples.map((example) => (
                            <li
                              key={example}
                              className="flex items-center gap-2"
                            >
                              <div className="w-1 h-1 bg-base-content/50 rounded-full" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="btn btn-primary btn-sm flex-1">
                        <ExternalLink className="w-4 h-4" />
                        ドキュメント
                      </button>
                      <button className="btn btn-ghost btn-sm">
                        <Code className="w-4 h-4" />
                        サンプル
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* プラグイン詳細モーダル */}
        {selectedPlugin && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{selectedPlugin.name}</h3>
                  <p className="text-base-content/70">
                    v{selectedPlugin.version}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={() => setSelectedPlugin(null)}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">説明</h4>
                  <p className="text-sm text-base-content/80">
                    {selectedPlugin.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">作者</h4>
                    <p className="text-sm">{selectedPlugin.author}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">カテゴリ</h4>
                    <p className="text-sm">{selectedPlugin.category}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">権限</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedPlugin.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="badge badge-warning badge-sm"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {selectedPlugin.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedPlugin.downloads.toLocaleString()}
                    </div>
                  </div>
                  {selectedPlugin.verified && (
                    <div className="flex items-center gap-1 text-success">
                      <Shield className="w-4 h-4" />
                      認証済み
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => setSelectedPlugin(null)}
                >
                  閉じる
                </button>
                {selectedPlugin.status === "installed"
                  ? (
                    <button
                      className="btn btn-error"
                      onClick={() =>
                        handlePluginAction(selectedPlugin, "uninstall")}
                    >
                      <Trash2 className="w-4 h-4" />
                      アンインストール
                    </button>
                  )
                  : (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        handlePluginAction(selectedPlugin, "install")}
                    >
                      <Download className="w-4 h-4" />
                      インストール
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
