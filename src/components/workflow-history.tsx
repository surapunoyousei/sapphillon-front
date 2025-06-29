import { useEffect, useState } from "react";
import { Card } from "@/components/common/card.tsx";
import { Button } from "@/components/common/button.tsx";
import { AlertCircle, CheckCircle, Clock, Trash2 } from "lucide-react";

interface WorkflowHistoryItem {
  id: string;
  goal: string;
  status: "success" | "failed" | "running";
  timestamp: Date;
  output?: string;
  error?: string;
}

export function WorkflowHistory() {
  const [history, setHistory] = useState<WorkflowHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("workflow-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      } catch (error) {
        console.error("履歴の読み込みに失敗しました:", error);
      }
    }
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("workflow-history");
  };

  const removeItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem("workflow-history", JSON.stringify(newHistory));
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(timestamp);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">実行履歴</h2>
        {history.length > 0 && (
          <Button
            onClick={clearHistory}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            履歴をクリア
          </Button>
        )}
      </div>

      {history.length === 0
        ? (
          <Card className="bg-black/10 backdrop-blur-sm border-white/5">
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">
                まだワークフローを実行していません
              </p>
            </div>
          </Card>
        )
        : (
          <div className="space-y-3">
            {history.map((item) => (
              <Card
                key={item.id}
                className="bg-black/10 backdrop-blur-sm border-white/5"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.status === "success" && (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      )}
                      {item.status === "failed" && (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                      {item.status === "running" && (
                        <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-blue-400 flex-shrink-0">
                        </div>
                      )}
                      <span className="text-white font-medium">
                        {item.status === "success"
                          ? "成功"
                          : item.status === "failed"
                          ? "失敗"
                          : "実行中"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <Button
                        onClick={() => removeItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                    <p className="text-slate-300 text-sm">{item.goal}</p>
                  </div>

                  {item.output && (
                    <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                      <pre className="text-green-300 text-sm whitespace-pre-wrap overflow-auto max-h-32">
                      {item.output}
                      </pre>
                    </div>
                  )}

                  {item.error && (
                    <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{item.error}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
