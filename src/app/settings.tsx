import { useState } from "react";
import {
  Battery,
  Bell,
  Brain,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  Globe,
  HardDrive,
  Keyboard,
  Lock,
  Monitor,
  Mouse,
  Palette,
  RefreshCw,
  Save,
  Server,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Upload,
  Volume2,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "../components/common/button.tsx";
import { Input } from "../components/common/input.tsx";
import { Card } from "../components/common/card.tsx";
import { Switch } from "../components/common/switch.tsx";

interface LLMModel {
  id: string;
  name: string;
  size: string;
  status: "installed" | "available" | "downloading";
  description: string;
  capabilities: string[];
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("llm");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [settings, setSettings] = useState({
    // LLM Settings
    llm: {
      selectedModel: "gemma-3n-E4B",
      apiKey: "sk-1234567890abcdef",
      temperature: 0.7,
      maxTokens: 2048,
      enableLocalMode: true,
      enableCloudFallback: false,
      ragEnabled: true,
      vectorDbPath: "/data/vectordb",
    },
    // System Settings
    system: {
      autoStart: true,
      minimizeToTray: true,
      enableTelemetry: false,
      logLevel: "info",
      maxMemoryUsage: 4096,
      enableGpuAcceleration: true,
      autoUpdate: true,
      updateChannel: "stable",
    },
    // Security Settings
    security: {
      encryptLocalData: true,
      requireAuth: false,
      sessionTimeout: 30,
      allowRemoteAccess: false,
      enableSandbox: true,
      auditLogging: true,
      secureMode: true,
    },
    // UI Settings
    ui: {
      theme: "auto",
      language: "ja",
      fontSize: "medium",
      enableAnimations: true,
      showNotifications: true,
      compactMode: false,
      enableSounds: true,
    },
    // Network Settings
    network: {
      proxyEnabled: false,
      proxyHost: "",
      proxyPort: 8080,
      enableIpv6: true,
      dnsServers: ["8.8.8.8", "8.8.4.4"],
      connectionTimeout: 10000,
    },
  });

  const [llmModels] = useState<LLMModel[]>([
    {
      id: "gemma-3n-E4B",
      name: "Gemma 3 Nano (E4B)",
      size: "2.4 GB",
      status: "installed",
      description: "軽量で高速な推論が可能なモデル",
      capabilities: ["テキスト生成", "要約", "翻訳", "Q&A"],
    },
    {
      id: "llama-3.1-8B",
      name: "Llama 3.1 8B",
      size: "8.5 GB",
      status: "available",
      description: "バランスの取れた高性能モデル",
      capabilities: ["テキスト生成", "コード生成", "分析", "推論"],
    },
    {
      id: "mistral-7B",
      name: "Mistral 7B",
      size: "7.2 GB",
      status: "available",
      description: "効率的で高品質な出力を生成",
      capabilities: ["テキスト生成", "要約", "分類", "抽出"],
    },
    {
      id: "deepseek-coder",
      name: "DeepSeek Coder",
      size: "6.8 GB",
      status: "downloading",
      description: "DeepSeek のコード生成モデル",
      capabilities: ["コード生成", "デバッグ", "リファクタリング", "説明"],
    },
    {
      id: "Gemini-2.5-Flash",
      name: "Gemini 2.5 Flash",
      size: "API Key のみ",
      status: "available",
      description: "Google の最新のモデル",
      capabilities: ["テキスト生成", "要約", "翻訳", "Q&A"],
    },
  ]);

  const tabs = [
    { id: "llm", name: "LLM設定", icon: Brain },
    // { id: "system", name: "システム", icon: Cpu },
    // { id: "security", name: "セキュリティ", icon: Shield },
    { id: "ui", name: "インターフェース", icon: Palette },
    // { id: "network", name: "ネットワーク", icon: Wifi },
  ];

  const handleSave = () => {
    // TODO: Save settings to backend
    console.log("Settings saved:", settings);
    setIsDirty(false);
  };

  const handleReset = () => {
    // TODO: Reset to default settings
    console.log("Settings reset");
    setIsDirty(false);
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
    setIsDirty(true);
  };

  const getModelStatusBadge = (status: string) => {
    switch (status) {
      case "installed":
        return (
          <span className="badge badge-success badge-sm font-medium">
            インストール済み
          </span>
        );
      case "downloading":
        return (
          <span className="badge badge-warning badge-sm font-medium">
            ダウンロード中
          </span>
        );
      default:
        return (
          <span className="badge badge-ghost badge-sm font-medium">
            利用可能
          </span>
        );
    }
  };

  const renderLLMSettings = () => (
    <div className="space-y-8">
      <Card className="p-8 bg-gradient-to-br from-base-100 to-base-200/30 border-2 border-base-300/30">
        <h3 className="text-xl font-bold mb-6 flex items-center text-base-content">
          <Brain className="w-6 h-6 mr-3 text-primary" />
          LLM モデル設定
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-base-content">
              使用モデル
            </label>
            <select
              className="select select-bordered w-full h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
              value={settings.llm.selectedModel}
              onChange={(e) =>
                updateSetting("llm", "selectedModel", e.target.value)}
            >
              {llmModels.filter((m) => m.status === "installed").map(
                (model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ),
              )}
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-gradient-to-br from-base-100 to-base-200/30 border-2 border-base-300/30">
        <h3 className="text-xl font-bold mb-6 text-base-content">
          利用可能なモデル
        </h3>
        <div className="space-y-4">
          {llmModels.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-6 border-2 border-base-300/30 rounded-xl bg-base-200/20 hover:bg-base-200/40 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-bold text-base text-base-content">
                    {model.name}
                  </h4>
                  {getModelStatusBadge(model.status)}
                </div>
                <p className="text-sm text-base-content/80 font-medium mb-3">
                  {model.description}
                </p>
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-base-300/60 text-base-content font-semibold px-3 py-1.5 rounded-lg">
                    {model.size}
                  </span>
                  {model.capabilities.slice(0, 2).map((cap) => (
                    <span
                      key={cap}
                      className="text-xs bg-primary/15 text-primary font-semibold px-3 py-1.5 rounded-lg"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {model.status === "installed"
                  ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )
                  : model.status === "downloading"
                  ? (
                    <Button variant="ghost" size="sm" disabled>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </Button>
                  )
                  : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="font-semibold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      インストール
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-8">
      <Card className="p-8 bg-gradient-to-br from-base-100 to-base-200/30 border-2 border-base-300/30">
        <h3 className="text-xl font-bold mb-6 flex items-center text-base-content">
          <Cpu className="w-6 h-6 mr-3 text-primary" />
          システム設定
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              自動起動
            </span>
            <Switch
              checked={settings.system.autoStart}
              onCheckedChange={(checked) =>
                updateSetting("system", "autoStart", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              トレイに最小化
            </span>
            <Switch
              checked={settings.system.minimizeToTray}
              onCheckedChange={(checked) =>
                updateSetting("system", "minimizeToTray", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              テレメトリー送信
            </span>
            <Switch
              checked={settings.system.enableTelemetry}
              onCheckedChange={(checked) =>
                updateSetting("system", "enableTelemetry", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              GPU アクセラレーション
            </span>
            <Switch
              checked={settings.system.enableGpuAcceleration}
              onCheckedChange={(checked) =>
                updateSetting("system", "enableGpuAcceleration", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              自動アップデート
            </span>
            <Switch
              checked={settings.system.autoUpdate}
              onCheckedChange={(checked) =>
                updateSetting("system", "autoUpdate", checked)}
            />
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-base-content">
              ログレベル
            </label>
            <select
              className="select select-bordered w-full h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
              value={settings.system.logLevel}
              onChange={(e) =>
                updateSetting("system", "logLevel", e.target.value)}
            >
              <option value="error">エラーのみ</option>
              <option value="warn">警告以上</option>
              <option value="info">情報以上</option>
              <option value="debug">デバッグ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-base-content">
              最大メモリ使用量 (MB)
            </label>
            <Input
              type="number"
              value={settings.system.maxMemoryUsage}
              onChange={(e) =>
                updateSetting(
                  "system",
                  "maxMemoryUsage",
                  parseInt(e.target.value),
                )}
              className="w-full h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <Card className="p-8 bg-gradient-to-br from-base-100 to-base-200/30 border-2 border-base-300/30">
        <h3 className="text-xl font-bold mb-6 flex items-center text-base-content">
          <Shield className="w-6 h-6 mr-3 text-primary" />
          セキュリティ設定
        </h3>

        <div className="mt-8">
          <label className="block text-sm font-semibold mb-3 text-base-content">
            セッションタイムアウト (分)
          </label>
          <Input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) =>
              updateSetting(
                "security",
                "sessionTimeout",
                parseInt(e.target.value),
              )}
            className="w-full h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
          />
        </div>
      </Card>
    </div>
  );

  const renderUISettings = () => (
    <div className="space-y-8">
      <Card className="p-8 bg-gradient-to-br from-base-100 to-base-200/30 border-2 border-base-300/30">
        <h3 className="text-xl font-bold mb-6 flex items-center text-base-content">
          <Palette className="w-6 h-6 mr-3 text-primary" />
          インターフェース設定
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-base-content">
              テーマ
            </label>
            <select
              className="select select-bordered w-full h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
              value={settings.ui.theme}
              onChange={(e) => updateSetting("ui", "theme", e.target.value)}
            >
              <option value="auto">自動</option>
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-base-content">
              言語
            </label>
            <select
              className="select select-bordered w-full h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
              value={settings.ui.language}
              onChange={(e) => updateSetting("ui", "language", e.target.value)}
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-base-content">
              フォントサイズ
            </label>
            <select
              className="select select-bordered w-full h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
              value={settings.ui.fontSize}
              onChange={(e) => updateSetting("ui", "fontSize", e.target.value)}
            >
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              アニメーション
            </span>
            <Switch
              checked={settings.ui.enableAnimations}
              onCheckedChange={(checked) =>
                updateSetting("ui", "enableAnimations", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              通知表示
            </span>
            <Switch
              checked={settings.ui.showNotifications}
              onCheckedChange={(checked) =>
                updateSetting("ui", "showNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              コンパクトモード
            </span>
            <Switch
              checked={settings.ui.compactMode}
              onCheckedChange={(checked) =>
                updateSetting("ui", "compactMode", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              効果音
            </span>
            <Switch
              checked={settings.ui.enableSounds}
              onCheckedChange={(checked) =>
                updateSetting("ui", "enableSounds", checked)}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNetworkSettings = () => (
    <div className="space-y-8">
      <Card className="p-8 bg-gradient-to-br from-base-100 to-base-200/30 border-2 border-base-300/30">
        <h3 className="text-xl font-bold mb-6 flex items-center text-base-content">
          <Wifi className="w-6 h-6 mr-3 text-primary" />
          ネットワーク設定
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              プロキシ有効化
            </span>
            <Switch
              checked={settings.network.proxyEnabled}
              onCheckedChange={(checked) =>
                updateSetting("network", "proxyEnabled", checked)}
            />
          </div>

          {settings.network.proxyEnabled && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-base-content">
                  プロキシホスト
                </label>
                <Input
                  type="text"
                  value={settings.network.proxyHost}
                  onChange={(e) =>
                    updateSetting("network", "proxyHost", e.target.value)}
                  placeholder="proxy.example.com"
                  className="h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 text-base-content">
                  ポート
                </label>
                <Input
                  type="number"
                  value={settings.network.proxyPort}
                  onChange={(e) =>
                    updateSetting(
                      "network",
                      "proxyPort",
                      parseInt(e.target.value),
                    )}
                  className="h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-base-200/40 rounded-xl border border-base-300/30">
            <span className="text-sm font-semibold text-base-content">
              IPv6 有効化
            </span>
            <Switch
              checked={settings.network.enableIpv6}
              onCheckedChange={(checked) =>
                updateSetting("network", "enableIpv6", checked)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-base-content">
              接続タイムアウト (ms)
            </label>
            <Input
              type="number"
              value={settings.network.connectionTimeout}
              onChange={(e) =>
                updateSetting(
                  "network",
                  "connectionTimeout",
                  parseInt(e.target.value),
                )}
              className="w-full h-12 text-base bg-base-200/60 border-base-300/50 focus:border-primary/60 rounded-xl"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "llm":
        return renderLLMSettings();
      case "system":
        return renderSystemSettings();
      case "security":
        return renderSecuritySettings();
      case "ui":
        return renderUISettings();
      case "network":
        return renderNetworkSettings();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-3">設定</h1>
            <p className="text-lg text-base-content font-medium">
              Floorp OS の動作を詳細に設定できます
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isDirty && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="light"
                  onClick={handleReset}
                  className="font-semibold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  リセット
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <Card className="p-6 bg-gradient-to-br from-base-100 to-base-200/30 border-2 border-base-300/30">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg"
                          : "hover:bg-base-200/60 text-base-content font-medium"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
