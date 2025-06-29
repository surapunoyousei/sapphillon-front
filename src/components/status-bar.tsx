import { useEffect, useState } from "react";
import { Card } from "@/components/common/card.tsx";
import { Button } from "@/components/common/button.tsx";
import { APIClient } from "@/lib/requests.ts";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface StatusBarProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

interface ServerStatus {
  main: boolean;
  tools: boolean;
  mainError?: string;
  toolsError?: string;
}

export function StatusBar({ isConnected, setIsConnected }: StatusBarProps) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    main: false,
    tools: false,
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    const newStatus: ServerStatus = {
      main: false,
      tools: false,
    };

    try {
      await APIClient.main.getStatus();
      newStatus.main = true;
      console.log("Main API (port 5001): 接続成功");
    } catch (error) {
      newStatus.mainError = error instanceof Error
        ? error.message
        : "接続エラー";
      console.error("Main API (port 5001): 接続失敗", error);
    }

    try {
      await APIClient.tools.getStatus();
      newStatus.tools = true;
      console.log("Tools API (port 5000): 接続成功");
    } catch (error) {
      newStatus.toolsError = error instanceof Error
        ? error.message
        : "接続エラー";
      console.error("Tools API (port 5000): 接続失敗", error);
    }

    setServerStatus(newStatus);
    const bothConnected = newStatus.main && newStatus.tools;
    setIsConnected(bothConnected);
    setIsChecking(false);

    console.log("接続状況:", {
      main: newStatus.main,
      tools: newStatus.tools,
      overall: bothConnected,
    });
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-blue-400" />
      );
    }
    if (serverStatus.main && serverStatus.tools) {
      return <Wifi className="w-5 h-5 text-green-400" />;
    }
    if (serverStatus.main || serverStatus.tools) {
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
    return <WifiOff className="w-5 h-5 text-red-400" />;
  };

  const getStatusText = () => {
    if (isChecking) return "接続状況を確認中...";
    if (serverStatus.main && serverStatus.tools) {
      return "全てのサーバーに接続済み";
    }
    if (serverStatus.main && !serverStatus.tools) {
      return "Main API接続済み / Tools API未接続";
    }
    if (!serverStatus.main && serverStatus.tools) {
      return "Tools API接続済み / Main API未接続";
    }
    return "全てのサーバーに接続できません";
  };

  return (
    <div className="p-4">
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <span className="text-white font-medium">
                {getStatusText()}
              </span>
            </div>
            <Button
              onClick={checkConnection}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              disabled={isChecking}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
              />
              再接続
            </Button>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  serverStatus.main ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span className="text-slate-300">
                Main API (5001): {serverStatus.main ? "接続済み" : "未接続"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  serverStatus.tools ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span className="text-slate-300">
                Tools API (5000): {serverStatus.tools ? "接続済み" : "未接続"}
              </span>
            </div>
          </div>

          {(serverStatus.mainError || serverStatus.toolsError) && (
            <div className="mt-2 text-xs text-red-300">
              {serverStatus.mainError && (
                <div>Main API: {serverStatus.mainError}</div>
              )}
              {serverStatus.toolsError && (
                <div>Tools API: {serverStatus.toolsError}</div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
