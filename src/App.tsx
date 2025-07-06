import { Route, Routes } from "react-router-dom";
import { AppBackground } from "./components/app-background.tsx";
import { Header } from "./components/header.tsx";
import { Home } from "./app/index.tsx";
import { WorkflowPage } from "./app/workflow.tsx";
import { PluginsPage } from "./app/plugins.tsx";
import { SettingsPage } from "./app/settings.tsx";

function App() {
  return (
    <>
      {/* <AppBackground /> */}
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workflows" element={<WorkflowPage />} />
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
