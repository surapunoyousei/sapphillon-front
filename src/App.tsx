import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppBackground } from "./components/app-background.tsx";
import { Header } from "./components/header.tsx";
import { AppSidebar } from "./components/navigation/app-sidebar.tsx";
import { Home } from "./app/index.tsx";
import { Debug } from "./app/debug.tsx";
import { WorkflowsRoot } from "./app/workflows-root.tsx";
import { WorkflowsManage } from "./app/workflows.tsx";
import { Generate } from "./app/generate.tsx";
import { Run } from "./app/run.tsx";
import { EditWorkflow } from "./app/edit.tsx";
import { Plugins } from "./app/plugins.tsx";
import { Settings as SettingsPage } from "./app/settings.tsx";

function App() {
  return (
    <Router>
      <AppBackground />
      <div className="flex min-h-screen w-full flex-row bg-base-100/80">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 flex flex-col min-h-0">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Workflow Root with Tabs */}
              <Route path="/workflows" element={<WorkflowsRoot />}>
                <Route index element={<WorkflowsManage />} />
                <Route path="generate" element={<Generate />} />
              </Route>
              {/* Deep workflow routes outside tab layout */}
              <Route path="/workflows/run/:id" element={<Run />} />
              <Route path="/workflows/edit/:id" element={<EditWorkflow />} />
              {/* Plugin Routes */}
              <Route path="/plugins" element={<Plugins />} />
              {/* Settings & Debug */}
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
