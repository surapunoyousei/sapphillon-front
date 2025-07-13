import { Route, Routes } from "react-router-dom";
import { AppBackground } from "./components/app-background.tsx";
import { Header } from "./components/header.tsx";
import { Home } from "./app/index.tsx";
import { WorkflowPage } from "./app/workflow.tsx";
import { WorkflowGenerationPage } from "./app/workflow-generation.tsx";
import { WorkflowExecutionPage } from "./app/workflow-execution.tsx";
import { WorkflowDetailPage } from "./app/workflow-detail.tsx";
import { PluginsPage } from "./app/plugins.tsx";
import { SettingsPage } from "./app/settings.tsx";

function App() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workflows" element={<WorkflowPage />} />
          <Route
            path="/workflows/generate"
            element={<WorkflowGenerationPage />}
          />
          <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
          <Route
            path="/workflows/:id/execution"
            element={<WorkflowExecutionPage />}
          />
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
