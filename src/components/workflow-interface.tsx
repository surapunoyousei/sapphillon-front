import { useState } from "react";
import { Card } from "@/components/common/card.tsx";
import { Button } from "@/components/common/button.tsx";
import { Input } from "@/components/common/input.tsx";
import { Separator } from "@/components/common/separator.tsx";
import { WorkflowExecutor } from "@/components/workflow-executor.tsx";
import { WorkflowHistory } from "@/components/workflow-history.tsx";
import { History, Settings, Zap } from "lucide-react";

interface WorkflowInterfaceProps {
  isConnected: boolean;
}

export function WorkflowInterface({ isConnected }: WorkflowInterfaceProps) {
  const [goal, setGoal] = useState("");
  const [activeTab, setActiveTab] = useState<
    "execute" | "history" | "settings"
  >("execute");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant={activeTab === "execute" ? "default" : "ghost"}
              onClick={() => setActiveTab("execute")}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              ワークフロー実行
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              onClick={() => setActiveTab("history")}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              実行履歴
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              設定
            </Button>
          </div>

          <Separator className="mb-6" />

          {activeTab === "execute" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  自然言語でワークフローを実行
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="例: Geminiについて調べて、結果をまとめたテキストファイルを作成して"
                      value={goal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setGoal(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      disabled={!goal.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      ワークフローを実行
                    </Button>
                    {!isConnected && (
                      <div className="text-yellow-400 text-sm">
                        ⚠️
                        一部のサーバーに接続できていません。機能が制限される可能性があります。
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <WorkflowExecutor
                goal={goal}
                setGoal={setGoal}
                isConnected={isConnected}
              />
            </div>
          )}

          {activeTab === "history" && <WorkflowHistory />}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">設定</h2>
              <div className="text-slate-300">
                <p>
                  バックエンドサーバーの設定やプラグイン管理など、今後実装予定の機能です。
                </p>
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium mb-2">現在の設定:</h3>
                  <ul className="text-sm space-y-1">
                    <li>Main API: http://localhost:5001</li>
                    <li>Tools API: http://localhost:5000</li>
                    <li>接続タイムアウト: 10秒</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
