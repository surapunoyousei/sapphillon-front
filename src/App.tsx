import { Route, Routes } from "react-router-dom";
import { AppBackground } from "./components/app-background.tsx";
import { Header } from "./components/header.tsx";
import { Home } from "./app/index.tsx";
import { WorkflowManager } from "./app/workflow.tsx";
import { SystemMonitor } from "./app/system-monitor.tsx";
import { PluginManager } from "./app/plugin-manager.tsx";
import { LLMInterface } from "./app/llm-interface.tsx";

function App() {
  return (
    <>
      <AppBackground />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workflows" element={<WorkflowManager />} />
          <Route path="/system-monitor" element={<SystemMonitor />} />
          <Route path="/plugins" element={<PluginManager />} />
          <Route path="/ai-assistant" element={<LLMInterface />} />
          <Route
            path="/settings"
            element={
              <div className="p-6">
                <h1 className="text-2xl">設定</h1>
                <p>システム設定画面（開発中）</p>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
