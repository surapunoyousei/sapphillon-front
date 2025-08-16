import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppBackground } from "./components/app-background.tsx";
import { Header } from "./components/header.tsx";
import { Home } from "./app/index.tsx";
import { Debug } from "./app/debug.tsx";
import { Chat } from "./app/chat.tsx";
import { Agent } from "./app/agent/index.tsx";
import { Plugins } from "./app/plugins.tsx";
import { Settings as SettingsPage } from "./app/settings.tsx"; // Renamed to avoid conflict
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
} from "./components/common/sidebar.tsx";
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  Plug,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function App() {
  return (
    <Router>
      <AppBackground />
      <div className="flex min-h-screen w-full flex-row bg-base-100/80">
        <Sidebar className="bg-base-200 shadow-lg border-r border-base-300 min-w-[220px]">
          <SidebarHeader>
            {/* サイドバーのロゴやアプリ名を表示 */}
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-2xl font-bold">
                Sapphillon
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {/* メインナビゲーション */}
              <div className="mt-2">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary ${
                      isActive
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-base-content"
                    }`}
                  end
                >
                  <LayoutDashboard size={22} />
                  <span>Home</span>
                </NavLink>
                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary ${
                      isActive
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-base-content"
                    }`}
                >
                  <MessageSquare size={22} />
                  <span>Chat</span>
                </NavLink>
                <NavLink
                  to="/agent"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary ${
                      isActive
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-base-content"
                    }`}
                >
                  <Bot size={22} />
                  <span>Agent</span>
                </NavLink>
                <NavLink
                  to="/plugins"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary ${
                      isActive
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-base-content"
                    }`}
                >
                  <Plug size={22} />
                  <span>Plugins</span>
                </NavLink>
              </div>
              {/* 区切り線 */}
              <div className="my-3 border-t border-base-300" />
              {/* サブナビゲーション */}
              <div>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary ${
                      isActive
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-base-content"
                    }`}
                >
                  <Settings size={22} />
                  <span>Settings</span>
                </NavLink>
                <NavLink
                  to="/debug"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary ${
                      isActive
                        ? "bg-primary/20 text-primary font-semibold"
                        : "text-base-content"
                    }`}
                >
                  <Settings size={22} />
                  <span>Debug</span>
                </NavLink>
              </div>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="/plugins" element={<Plugins />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/debug" element={<Debug />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
