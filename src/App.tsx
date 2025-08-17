import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppBackground } from "./components/app-background.tsx";
import { Header } from "./components/header.tsx";
import { AppSidebar } from "./components/navigation/app-sidebar.tsx";
import { Home } from "./app/index.tsx";
import { Debug } from "./app/debug.tsx";
import { Workflows } from "./app/workflows.tsx";
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
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Workflow Routes */}
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/generate" element={<Generate />} />
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
