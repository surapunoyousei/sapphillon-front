import { ThemeProvider } from "@/components/theme-provider.tsx";
import { AppBackground } from "@/components/app-background.tsx";
import { Header } from "@/components/header.tsx";
import "./index.css";
import { AppSidebar } from "./components/app-sidebar.tsx";
import { WorkflowInterface } from "./components/workflow-interface.tsx";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen overflow-hidden">
        <AppBackground />
        <div className="relative z-0 flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-auto p-6">
              <WorkflowInterface />
            </main>
            <AppSidebar />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
