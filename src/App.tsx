import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { AppBackground } from "@/components/app-background.tsx";
import { WorkflowInterface } from "@/components/workflow-interface.tsx";
import { StatusBar } from "@/components/status-bar.tsx";
import "./index.css";

function App() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <AppBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <StatusBar
            isConnected={isConnected}
            setIsConnected={setIsConnected}
          />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Floorp OS
                </h1>
                <p className="text-slate-300 text-lg">
                  ウェブとローカル環境を統合した次世代プラットフォーム
                </p>
              </div>
              <WorkflowInterface isConnected={isConnected} />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
