import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Bell,
  Home,
  Layers,
  Menu,
  MessageCircle,
  Package,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigationItems = [
    { path: "/", label: "ホーム", icon: Home },
    { path: "/workflows", label: "ワークフロー", icon: Layers },
    { path: "/system-monitor", label: "システム監視", icon: Activity },
    { path: "/plugins", label: "プラグイン", icon: Package },
    { path: "/ai-assistant", label: "AI アシスタント", icon: MessageCircle },
    { path: "/settings", label: "設定", icon: Settings },
  ];

  const currentTime = new Date().toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="bg-base-200 border-b border-base-content/10 sticky top-0 z-50">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* 左側: ロゴとナビゲーション */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-content rounded-sm"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">Floorp OS</h1>
                <p className="text-xs text-base-content/70 -mt-1">
                  Operation Software
                </p>
              </div>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-300 text-base-content"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 中央: 検索バー */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <input
                type="text"
                placeholder="システム全体を検索..."
                className="input input-bordered input-sm w-full pl-10 bg-base-100"
              />
            </div>
          </div>

          {/* 右側: システム情報とユーザー */}
          <div className="flex items-center gap-2">
            {/* システム情報 */}
            <div className="hidden sm:flex items-center gap-3 text-sm text-base-content/70 mr-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>システム正常</span>
              </div>
              <div className="divider divider-horizontal"></div>
              <time>{currentTime}</time>
            </div>

            {/* 通知 */}
            <button className="btn btn-ghost btn-sm btn-circle">
              <Bell className="w-4 h-4" />
            </button>

            {/* ユーザーメニュー */}
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                <User className="w-4 h-4" />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li className="menu-title">
                  <span>ユーザー</span>
                </li>
                <li>
                  <a>
                    <User className="w-4 h-4" />プロフィール
                  </a>
                </li>
                <li>
                  <a>
                    <Settings className="w-4 h-4" />設定
                  </a>
                </li>
                <li>
                  <hr />
                </li>
                <li>
                  <a>ログアウト</a>
                </li>
              </ul>
            </div>

            {/* モバイルメニュー */}
            <button
              className="btn btn-ghost btn-sm btn-circle md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen
                ? <X className="w-4 h-4" />
                : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* モバイルナビゲーション */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-base-content/10">
            <nav className="flex flex-col gap-1 mt-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-300 text-base-content"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* モバイル検索 */}
            <div className="mt-4 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
                <input
                  type="text"
                  placeholder="システム全体を検索..."
                  className="input input-bordered w-full pl-10 bg-base-100"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
