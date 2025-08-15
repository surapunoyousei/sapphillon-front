import { Bell, Github, Moon, Search, Sun } from "lucide-react";
import { Button } from "./common/button.tsx";
import { useTheme } from "./theme-provider.tsx";
import { Avatar, AvatarImage } from "./common/avatar.tsx";
import { SidebarTrigger } from "./common/sidebar.tsx";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header
      className="navbar bg-base-200/50 border-b border-base-300/20 sticky top-0 z-40 backdrop-blur-sm"
      role="banner"
      aria-label="メインナビゲーション"
    >
      <div className="navbar-start">
        <SidebarTrigger />
        <a
          className="btn btn-ghost text-xl"
          href="/"
          aria-label="Floorp OSホームに戻る"
        >
          <img
            src="/Floorp_Logo_OS_D_Dark.png"
            alt="Floorp OS Logo"
            className="w-48 h-12"
            loading="eager"
          />
        </a>
      </div>

      <div className="navbar-center hidden lg:flex">
        <div className="form-control">
          <div className="join">
            <input
              type="text"
              placeholder="検索..."
              className="input input-bordered input-sm join-item w-64"
              aria-label="検索フィールド"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // 検索処理をここに実装
                  console.log("検索:", e.currentTarget.value);
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="btn-square join-item"
              aria-label="検索実行"
              onClick={() => {
                // 検索処理をここに実装
                console.log("検索ボタンクリック");
              }}
            >
              <Search size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="navbar-end gap-1 sm:gap-2">
        {/* モバイル検索ボタン */}
        <div className="tooltip tooltip-bottom lg:hidden" data-tip="検索">
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle"
            aria-label="検索を開く"
            onClick={() => {
              // モバイル検索モーダルを開く処理
              console.log("モバイル検索を開く");
            }}
          >
            <Search size={18} />
          </Button>
        </div>

        {/* テーマ切り替えボタン */}
        <div
          className="tooltip tooltip-bottom"
          data-tip={resolvedTheme === "dark"
            ? "ライトモードに切り替え"
            : "ダークモードに切り替え"}
        >
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={`${
              resolvedTheme === "dark" ? "ライト" : "ダーク"
            }モードに切り替え`}
          >
            {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        {/* GitHubリンク */}
        <div className="tooltip tooltip-bottom" data-tip="GitHubで見る">
          <a
            href="https://github.com/Floorp-Projects/Floorp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHubリポジトリを開く"
            className="btn btn-ghost btn-sm btn-circle"
          >
            <Github size={18} />
          </a>
        </div>

        {/* 通知ボタン */}
        <div className="tooltip tooltip-bottom" data-tip="通知">
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle"
            aria-label="通知を表示"
          >
            <div className="indicator">
              <Bell size={18} />
              <span
                className="badge badge-xs badge-primary indicator-item animate-pulse"
                aria-label="新しい通知があります"
              >
                3
              </span>
            </div>
          </Button>
        </div>
        {/* ユーザーメニュー */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-primary/20 transition-all duration-200"
            aria-label="ユーザーメニューを開く"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage
                src="https://avatars.githubusercontent.com/u/124599?v=4"
                alt="ユーザーアバター"
              />
            </Avatar>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300/20"
            role="menu"
            aria-label="ユーザーメニュー"
          >
            <li>
              <a
                className="justify-between hover:bg-primary/10 transition-colors"
                role="menuitem"
                href="/profile"
              >
                プロフィール
                <span className="badge badge-success badge-xs">NEW</span>
              </a>
            </li>
            <li>
              <a
                className="hover:bg-primary/10 transition-colors"
                role="menuitem"
                href="/settings"
              >
                設定
              </a>
            </li>
            <li className="border-t border-base-300/20 mt-1 pt-1">
              <button
                type="button"
                className="text-error hover:bg-error/10 transition-colors w-full text-left"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  // ログアウト処理をここに実装
                  if (confirm("本当にログアウトしますか？")) {
                    console.log("ログアウトが実行されました");
                    // 実際のログアウト処理をここに実装
                  }
                }}
              >
                ログアウト
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
