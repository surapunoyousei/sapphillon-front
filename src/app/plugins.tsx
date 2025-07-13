import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Image,
  Lock,
  Mail,
  Map,
  MoreVertical,
  Music,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  Video,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "../components/common/button.tsx";
import { Input } from "../components/common/input.tsx";
import { Card } from "../components/common/card.tsx";

interface Plugin {
  id: string;
  name: string;
  description: string;
  category:
    | "web"
    | "system"
    | "ai"
    | "productivity"
    | "media"
    | "security"
    | "development";
  version: string;
  author: string;
  rating: number;
  downloads: number;
  size: string;
  status: "installed" | "available" | "updating" | "error";
  icon: React.ComponentType<any>;
  permissions: string[];
  lastUpdated: Date;
  isOfficial: boolean;
}

export function PluginsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: "1",
      name: "ファイルマネージャー",
      description:
        "ローカルファイルシステムに安全にアクセスし、ファイルの検索・整理・操作を行います",
      category: "system",
      version: "2.1.0",
      author: "Floorp Team",
      rating: 4.8,
      downloads: 15420,
      size: "2.3 MB",
      status: "installed",
      icon: FileText,
      permissions: [
        "ファイルシステム読み取り",
        "ファイルシステム書き込み",
        "フォルダ作成",
      ],
      lastUpdated: new Date(Date.now() - 86400000),
      isOfficial: true,
    },
    {
      id: "2",
      name: "メール操作",
      description:
        "Gmail や Outlook などのメールアプリを操作する機能を提供します。メールの送信、検索が可能です。",
      category: "productivity",
      version: "1.5.2",
      author: "Floorp Team",
      rating: 4.6,
      downloads: 8930,
      size: "1.8 MB",
      status: "installed",
      icon: Mail,
      permissions: ["ローカルアプリケーションへのアクセス"],
      lastUpdated: new Date(Date.now() - 172800000),
      isOfficial: true,
    },
    {
      id: "3",
      name: "Web スクレイピング by Browser",
      description:
        "Floorp ブラウザーをそのまま使用して、ウェブサイトから情報を抽出し、構造化されたデータとしてほかの機能等に提供します",
      category: "web",
      version: "3.0.1",
      author: "Community",
      rating: 4.4,
      downloads: 12650,
      size: "3.1 MB",
      status: "available",
      icon: Globe,
      permissions: [
        "ローカルアプリケーションへのアクセス",
        "Floorp ブラウザの操作",
      ],
      lastUpdated: new Date(Date.now() - 259200000),
      isOfficial: true,
    },
    {
      id: "4",
      name: "Google Map",
      description:
        "Google Map からあなたの位置情報やいた場所、お店の情報を検索します",
      category: "web",
      version: "1.2.0",
      author: "Floorp Team",
      rating: 4.7,
      downloads: 6780,
      size: "45.2 MB",
      status: "available",
      icon: Map,
      permissions: [
        "https://maps.google.com へのアクセス",
        "位置情報アクセス",
        "データ保存",
      ],
      lastUpdated: new Date(Date.now() - 345600000),
      isOfficial: true,
    },
    {
      id: "5",
      name: "システム監視",
      description:
        "CPU、メモリ、ディスク使用量を監視し、パフォーマンスを最適化します",
      category: "system",
      version: "2.3.1",
      author: "Floorp Team",
      rating: 4.5,
      downloads: 9840,
      size: "1.2 MB",
      status: "updating",
      icon: Cpu,
      permissions: ["システム情報読み取り", "プロセス監視", "ハードウェア情報"],
      lastUpdated: new Date(Date.now() - 432000000),
      isOfficial: true,
    },
    {
      id: "6",
      name: "データ入力用プラグイン",
      description:
        "データ入力用プラグインです。ほかの機能に対して、ワークフローの実行ごとにデータを入力することができます。",
      category: "productivity",
      version: "1.0.0",
      author: "Floorp Team",
      rating: 4.5,
      downloads: 1000,
      size: "1.2 MB",
      status: "available",
      icon: FileText,
      permissions: [],
      lastUpdated: new Date(Date.now() - 432000000),
      isOfficial: true,
    },
    {
      id: "6",
      name: "データ入力用プラグイン",
      description:
        "データ入力用プラグインです。ほかの機能に対して、ワークフローの実行ごとにデータを入力することができます。",
      category: "productivity",
      version: "1.0.0",
      author: "Floorp Team",
      rating: 4.5,
      downloads: 1000,
      size: "1.2 MB",
      status: "available",
      icon: FileText,
      permissions: [],
      lastUpdated: new Date(Date.now() - 432000000),
      isOfficial: true,
    },
  ]);

  const categories = [
    { id: "all", name: "すべて", icon: Zap },
    { id: "web", name: "ウェブ", icon: Globe },
    { id: "system", name: "システム", icon: Cpu },
    { id: "ai", name: "AI", icon: Zap },
    { id: "productivity", name: "生産性", icon: FileText },
    { id: "media", name: "メディア", icon: Image },
    { id: "security", name: "セキュリティ", icon: Shield },
    { id: "development", name: "開発", icon: Code },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "installed":
        return (
          <span className="badge badge-success badge-sm font-medium">
            インストール済み
          </span>
        );
      case "updating":
        return (
          <span className="badge badge-warning badge-sm font-medium">
            更新中
          </span>
        );
      case "error":
        return (
          <span className="badge badge-error badge-sm font-medium">エラー</span>
        );
      default:
        return (
          <span className="badge badge-ghost badge-sm font-medium">
            利用可能
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find((c) => c.id === category);
    if (!categoryData) return Zap;
    return categoryData.icon;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "web":
        return "from-base-200/60 to-base-300/40 border-base-300/50";
      case "system":
        return "from-base-200/60 to-base-300/40 border-base-300/50";
      case "ai":
        return "from-primary/10 to-primary/20 border-primary/30";
      case "productivity":
        return "from-base-200/60 to-base-300/40 border-base-300/50";
      case "media":
        return "from-base-200/60 to-base-300/40 border-base-300/50";
      case "security":
        return "from-error/10 to-error/20 border-error/30";
      case "development":
        return "from-base-200/60 to-base-300/40 border-base-300/50";
      default:
        return "from-base-200/60 to-base-300/40 border-base-300/50";
    }
  };

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" ||
      plugin.category === filterCategory;
    const matchesStatus = filterStatus === "all" ||
      plugin.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleInstall = (pluginId: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId ? { ...p, status: "updating" as const } : p
      )
    );

    // Simulate installation
    setTimeout(() => {
      setPlugins((prev) =>
        prev.map((p) =>
          p.id === pluginId ? { ...p, status: "installed" as const } : p
        )
      );
    }, 2000);
  };

  const handleUninstall = (pluginId: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === pluginId ? { ...p, status: "available" as const } : p
      )
    );
  };

  const installedCount = plugins.filter((p) => p.status === "installed").length;
  const availableCount = plugins.filter((p) => p.status === "available").length;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-3">
              プラグイン管理
            </h1>
            <p className="text-lg text-base-content font-medium">
              Floorp OS の機能を拡張するプラグインを管理できます
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="stats stats-horizontal shadow-xl bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/30">
              <div className="stat">
                <div className="stat-title text-xs font-semibold">
                  インストール済み
                </div>
                <div className="stat-value text-2xl text-success font-bold">
                  {installedCount}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-xs font-semibold">利用可能</div>
                <div className="stat-value text-2xl text-primary font-bold">
                  {availableCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
            <Input
              type="text"
              placeholder="プラグインを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-base-200/60 border-base-300/40 focus:bg-base-100 focus:border-primary/40 rounded-xl shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-base-content/50" />
            <select
              className="select select-bordered h-12 bg-base-200/60 border-base-300/40 focus:bg-base-100 focus:border-primary/40 rounded-xl"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered h-12 bg-base-200/60 border-base-300/40 focus:bg-base-100 focus:border-primary/40 rounded-xl"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">すべて</option>
              <option value="installed">インストール済み</option>
              <option value="available">利用可能</option>
              <option value="updating">更新中</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = filterCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setFilterCategory(category.id)}
                className={`flex items-center space-x-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-content shadow-lg scale-105"
                    : "bg-base-200/60 text-base-content hover:bg-base-300/60 hover:scale-105 shadow-sm"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Enhanced Plugins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredPlugins.map((plugin) => {
            const Icon = plugin.icon;
            const CategoryIcon = getCategoryIcon(plugin.category);
            const categoryColors = getCategoryColor(plugin.category);

            return (
              <Card
                key={plugin.id}
                className={`group p-8 bg-gradient-to-br ${categoryColors} hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${categoryColors} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 text-base-content" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-base-content group-hover:text-base-content transition-colors duration-200">
                          {plugin.name}
                        </h3>
                        {plugin.isOfficial && (
                          <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-success-content" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-base-content/70">
                        <CategoryIcon className="w-3 h-3" />
                        <span className="font-medium">
                          {categories.find((c) => c.id === plugin.category)
                            ?.name}
                        </span>
                        <span>•</span>
                        <span className="font-mono">v{plugin.version}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(plugin.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-base-content/80 leading-relaxed mb-6 line-clamp-2">
                  {plugin.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm mb-6">
                  <div className="flex items-center space-x-1 bg-base-100/50 px-3 py-1.5 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-base-content">
                      {plugin.rating}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-base-100/50 px-3 py-1.5 rounded-lg">
                    <Download className="w-4 h-4 text-base-content/60" />
                    <span className="font-semibold text-base-content">
                      {plugin.downloads.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-base-100/50 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold text-base-content">
                      {plugin.size}
                    </span>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-base-content/70 mb-3 uppercase tracking-wide">
                    必要な権限
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plugin.permissions.slice(0, 2).map((permission, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium bg-base-200/80 text-base-content/80 rounded-full border border-base-300/40"
                      >
                        {permission}
                      </span>
                    ))}
                    {plugin.permissions.length > 2 && (
                      <span className="px-3 py-1 text-xs font-medium bg-base-200/80 text-base-content/80 rounded-full border border-base-300/40">
                        +{plugin.permissions.length - 2} その他
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-base-300/30">
                  <div className="text-xs text-base-content/60 font-medium">
                    {plugin.author}
                  </div>
                  <div className="flex items-center space-x-2">
                    {plugin.status === "installed"
                      ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-9 h-9 p-0 rounded-lg hover:bg-base-100/60"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUninstall(plugin.id)}
                            className="w-9 h-9 p-0 rounded-lg text-error hover:bg-error/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                      : plugin.status === "updating"
                      ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="w-20 h-9 rounded-lg"
                        >
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </Button>
                      )
                      : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleInstall(plugin.id)}
                          className="px-4 h-9 rounded-lg font-semibold shadow-lg"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          インストール
                        </Button>
                      )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPlugins.length === 0 && (
          <Card className="p-16 text-center bg-gradient-to-br from-base-100 to-base-200/50 border-2 border-base-300/30">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Zap className="w-12 h-12 text-primary/60" />
            </div>
            <h3 className="text-2xl font-bold text-base-content mb-3">
              プラグインが見つかりません
            </h3>
            <p className="text-base-content/70 mb-6 text-lg">
              検索条件を変更してお試しください
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setFilterStatus("all");
              }}
              className="px-8 py-3 rounded-xl font-semibold"
            >
              フィルターをリセット
            </Button>
          </Card>
        )}

        {/* Plugin Development */}
        <div className="mt-16 text-center">
          <Card className="p-12 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 border-2 border-primary/20 shadow-2xl">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Code className="w-10 h-10 text-primary-content" />
            </div>
            <h3 className="text-3xl font-bold text-base-content mb-4">
              プラグインを開発しませんか？
            </h3>
            <p className="text-base-content/70 mb-8 text-lg max-w-2xl mx-auto">
              Floorp OS のプラグイン API
              を使用して、独自の機能を作成し、コミュニティと共有できます
            </p>
            <div className="flex justify-center space-x-6">
              <Button
                variant="primary"
                className="px-8 py-4 rounded-xl font-semibold text-lg shadow-lg"
              >
                <ExternalLink className="w-5 h-5 mr-3" />
                開発ドキュメント
              </Button>
              <Button
                variant="light"
                className="px-8 py-4 rounded-xl font-semibold text-lg shadow-lg"
              >
                <BookOpen className="w-5 h-5 mr-3" />
                プラグインについて
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
