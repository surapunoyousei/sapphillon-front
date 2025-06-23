import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Code,
  Download,
  Search,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon: string;
  status: "active" | "inactive" | "error";
  category: "automation" | "ai" | "data" | "utility";
  htmlContent?: string;
  hasCustomPanel?: boolean;
}

const samplePlugins: Plugin[] = [
  {
    id: "file-system",
    name: "File System",
    version: "1.2.0",
    description: "ローカルファイルシステムへのアクセス機能",
    author: "Floorp Team",
    icon: "📁",
    status: "active",
    category: "utility",
    hasCustomPanel: true,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {}
            }
          }
        </script>
      </head>
      <body class="p-0 m-0 bg-transparent">
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-green-700 dark:text-green-300 text-xs font-medium">接続済み</span>
          </div>
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span>監視ディレクトリ:</span>
              <span class="font-mono">~/Documents</span>
            </div>
            <div class="flex justify-between">
              <span>権限:</span>
              <span class="text-green-600 dark:text-green-400">読み書き可</span>
            </div>
          </div>
          <button class="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors mt-2" onclick="alert('設定画面を開きます')">設定</button>
        </div>
      </body>
      </html>
    `,
  },
  {
    id: "google-docs",
    name: "Google Docs",
    version: "2.1.0",
    description: "Google Documentsとの連携機能",
    author: "Google Inc.",
    icon: "📄",
    status: "active",
    category: "data",
    hasCustomPanel: true,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="p-0 m-0 bg-transparent">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span class="text-blue-700 dark:text-blue-300 text-xs font-medium">OAuth認証済み</span>
          </div>
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span>アカウント:</span>
              <span>user@example.com</span>
            </div>
            <div class="flex justify-between">
              <span>API使用:</span>
              <span>450/1000</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div class="bg-blue-600 h-1 rounded-full" style="width: 45%"></div>
            </div>
          </div>
          <div class="flex gap-1 mt-2">
            <button class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" onclick="alert('認証を更新します')">更新</button>
            <button class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors" onclick="alert('ログを表示します')">ログ</button>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  {
    id: "gmail",
    name: "Gmail Integration",
    version: "1.5.2",
    description: "Gmailの送受信とラベル管理",
    author: "Google Inc.",
    icon: "✉️",
    status: "inactive",
    category: "automation",
    hasCustomPanel: true,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="p-0 m-0 bg-transparent">
        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span class="text-gray-600 dark:text-gray-400 text-xs font-medium">非アクティブ</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-500 mb-2">
            プラグインを有効化してGmail連携を開始
          </p>
          <button class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors" onclick="alert('セットアップを開始します')">セットアップ</button>
        </div>
      </body>
      </html>
    `,
  },
  {
    id: "web-scraper",
    name: "Web Scraper",
    version: "0.8.1",
    description: "Webスクレイピング機能",
    author: "Community",
    icon: "🕷️",
    status: "error",
    category: "data",
    hasCustomPanel: true,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="p-0 m-0 bg-transparent">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span class="text-red-700 dark:text-red-300 text-xs font-medium">接続エラー</span>
          </div>
          <div class="text-xs space-y-1">
            <div class="text-red-600 dark:text-red-400">
              <strong>エラー:</strong> Rate limit (429)
            </div>
            <div><strong>復旧予定:</strong> 約30分後</div>
          </div>
          <div class="flex gap-1 mt-2">
            <button class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors" onclick="alert('再試行します')">再試行</button>
            <button class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors" onclick="alert('ログを表示します')">ログ</button>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  {
    id: "office-kit",
    name: "Office Kit",
    version: "3.0.0",
    description: "Microsoft Office連携ツール",
    author: "Microsoft Corp.",
    icon: "📊",
    status: "active",
    category: "data",
    hasCustomPanel: true,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="p-0 m-0 bg-transparent">
        <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-3">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span class="text-purple-700 dark:text-purple-300 text-xs font-medium">M365 連携中</span>
          </div>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <div class="text-center p-1 bg-white dark:bg-gray-800 rounded">
              <div class="font-bold text-purple-600 text-xs">Excel</div>
              <div class="text-xs opacity-70">12件</div>
            </div>
            <div class="text-center p-1 bg-white dark:bg-gray-800 rounded">
              <div class="font-bold text-blue-600 text-xs">Word</div>
              <div class="text-xs opacity-70">3件</div>
            </div>
          </div>
          <div class="flex gap-1 mt-2">
            <button class="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors" onclick="alert('統計画面を開きます')">統計</button>
            <button class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors" onclick="alert('設定画面を開きます')">設定</button>
          </div>
        </div>
      </body>
      </html>
    `,
  },
];

export function PluginManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [plugins, setPlugins] = useState(samplePlugins);
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set());

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" ||
      plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const togglePluginStatus = (pluginId: string) => {
    setPlugins((prev) =>
      prev.map((plugin) =>
        plugin.id === pluginId
          ? {
            ...plugin,
            status: plugin.status === "active" ? "inactive" : "active",
          }
          : plugin
      )
    );
  };

  const togglePanel = (pluginId: string) => {
    setExpandedPanels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pluginId)) {
        newSet.delete(pluginId);
      } else {
        newSet.add(pluginId);
      }
      return newSet;
    });
  };

  const createDataUrl = (htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    return URL.createObjectURL(blob);
  };

  const getStatusBadge = (status: Plugin["status"]) => {
    switch (status) {
      case "active":
        return (
          <div className="badge badge-success badge-sm gap-1">
            <Shield className="w-2 h-2" />Active
          </div>
        );
      case "inactive":
        return <div className="badge badge-ghost badge-sm">Inactive</div>;
      case "error":
        return (
          <div className="badge badge-error badge-sm gap-1">
            <AlertTriangle className="w-2 h-2" />Error
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-100">
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">プラグイン管理</h2>

          <div className="flex gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-primary text-sm">
                {plugins.length}
              </div>
              <div className="text-base-content/60">総数</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-success text-sm">
                {plugins.filter((p) => p.status === "active").length}
              </div>
              <div className="text-base-content/60">Active</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-error text-sm">
                {plugins.filter((p) => p.status === "error").length}
              </div>
              <div className="text-base-content/60">Error</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-base-content/50" />
            <input
              type="text"
              placeholder="プラグインを検索..."
              className="input input-sm input-bordered w-full pl-7"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="select select-sm select-bordered min-w-32"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">すべて</option>
            <option value="automation">自動化</option>
            <option value="ai">AI・LLM</option>
            <option value="data">データ</option>
            <option value="utility">ツール</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {filteredPlugins.map((plugin) => (
            <div key={plugin.id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{plugin.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">
                          {plugin.name}
                        </h3>
                        {getStatusBadge(plugin.status)}
                      </div>
                      <p className="text-xs text-base-content/60 truncate">
                        v{plugin.version} • {plugin.author}
                      </p>
                      <p className="text-xs text-base-content/80 mt-1 line-clamp-1">
                        {plugin.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    {plugin.status !== "error" && (
                      <button
                        className={`btn btn-xs ${
                          plugin.status === "active"
                            ? "btn-error"
                            : "btn-success"
                        }`}
                        onClick={() => togglePluginStatus(plugin.id)}
                      >
                        {plugin.status === "active" ? "停止" : "開始"}
                      </button>
                    )}

                    <div className="dropdown dropdown-end">
                      <button className="btn btn-xs btn-ghost">
                        <Settings className="w-3 h-3" />
                      </button>
                      <ul className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-32">
                        <li>
                          <a className="text-xs">設定</a>
                        </li>
                        {plugin.status === "error" && (
                          <li>
                            <a className="text-xs text-warning">
                              再インストール
                            </a>
                          </li>
                        )}
                        <li>
                          <a className="text-xs text-error">削除</a>
                        </li>
                      </ul>
                    </div>

                    {plugin.hasCustomPanel && (
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => togglePanel(plugin.id)}
                      >
                        <Code className="w-3 h-3" />
                        {expandedPanels.has(plugin.id)
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {plugin.hasCustomPanel && expandedPanels.has(plugin.id) && (
                  <div className="mt-2 pt-2 border-t border-base-300">
                    <iframe
                      src={createDataUrl(plugin.htmlContent || "")}
                      className="w-full h-32 border-0 rounded bg-transparent"
                      sandbox="allow-scripts allow-modals"
                      title={`${plugin.name} Status Panel`}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPlugins.length === 0 && (
          <div className="text-center py-8">
            <div className="text-base-content/50">
              プラグインが見つかりません
            </div>
            <p className="text-base-content/40 text-xs">
              検索条件を変更してください
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
}
