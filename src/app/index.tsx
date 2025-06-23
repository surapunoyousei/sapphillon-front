import { Button } from "@/components/common/button.tsx";
import { Card } from "@/components/common/card.tsx";
import { sampleWorkflows } from "@/data/sample-workflows.ts";
import { Brain, Calendar, Plug } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const handleCreateWorkflow = () => {
    navigate("/workflow");
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Floorp OS</h1>
          <p className="text-xl text-base-content/70 mb-2">
            Operation Software - 次世代プラットフォーム
          </p>
          <p className="text-base-content/60 max-w-2xl mx-auto">
            ウェブブラウザとローカルOSを統合し、LLMを活用した自動化ワークフローで
            あなたの作業を革新的に効率化します
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <Brain className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">ローカルLLM搭載</h3>
            <p className="text-sm text-base-content/60">
              データを外部に送信することなく、高度なAI処理をローカルで実行
            </p>
          </Card>
          <Card className="p-6">
            <Plug className="w-8 h-8 text-secondary mb-4" />
            <h3 className="font-semibold mb-2">プラグインエコシステム</h3>
            <p className="text-sm text-base-content/60">
              サンドボックス環境で安全に機能を拡張できるプラグインシステム
            </p>
          </Card>
          <Card className="p-6">
            <Calendar className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">自動化ワークフロー</h3>
            <p className="text-sm text-base-content/60">
              定期実行やトリガーベースの自動化で作業を効率化
            </p>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-6">ワークフローサンプル</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold mb-2">{workflow.name}</h3>
              <p className="text-sm text-base-content/60 mb-4">
                {workflow.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-base-content/40">
                  {workflow.nodes.length} ステップ
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-auto"
                  onClick={() => {
                    globalThis.location.href = `/workflow?id=${workflow.id}`;
                  }}
                >
                  開く
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="primary"
            size="lg"
            className="w-auto"
            onClick={handleCreateWorkflow}
          >
            新しいワークフローを作成
          </Button>
        </div>
      </div>
    </div>
  );
}
