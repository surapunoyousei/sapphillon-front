import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WorkflowCanvas } from "./workflow-canvas.tsx";
import { ExecutionSidebar } from "./execution-sidebar.tsx";
import { PluginManager } from "./components/PluginManager.tsx";
import { Button } from "@/components/common/button.tsx";
import { sampleWorkflows } from "@/data/sample-workflows.ts";
import { Workflow } from "@/types/workflow.ts";
import { Bot, Puzzle, Settings, Workflow as WorkflowIcon } from "lucide-react";
import { getGeneratedWorkflowData } from "./utils/generationUtils.ts";

type TabType = "canvas" | "plugins";

export default function WorkflowPage() {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get("id");

  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(
    () => {
      if (workflowId) {
        const workflow = sampleWorkflows.find((w) => w.id === workflowId);
        if (workflow) return workflow;
      }
      return null;
    },
  );

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("canvas");
  const isExecutingRef = useRef<boolean>(false);
  const generationIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (workflowId) {
      const workflow = sampleWorkflows.find((w) => w.id === workflowId);
      if (workflow) {
        setCurrentWorkflow(workflow);
      }
    } else {
      setCurrentWorkflow(null);
    }
  }, [workflowId]);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (generationIntervalRef.current) {
        clearInterval(generationIntervalRef.current);
      }
    };
  }, []);

  const handleGenerateWorkflow = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    const { nodes, connections, name, description } = getGeneratedWorkflowData(
      prompt,
    );

    const workflowForGeneration: Workflow = {
      id: `wf-gen-${Date.now()}`,
      name: "ワークフロー生成中...",
      description: `プロンプト: "${prompt}"`,
      nodes,
      connections,
      generationState: {
        currentStep: 0,
        status: "pending",
        isActive: true,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentWorkflow(workflowForGeneration);

    generationIntervalRef.current = window.setInterval(() => {
      setCurrentWorkflow((prev) => {
        if (!prev) {
          if (generationIntervalRef.current) {
            clearInterval(generationIntervalRef.current);
          }
          return null;
        }

        const nextStep = prev.generationState.currentStep + 1;

        if (nextStep > 6) {
          if (generationIntervalRef.current) {
            clearInterval(generationIntervalRef.current);
          }
          setIsGenerating(false);
          return {
            ...prev,
            name,
            description,
            generationState: {
              currentStep: 0,
              status: "completed",
              isActive: false,
              lastUpdated: new Date(),
            },
          };
        }

        return {
          ...prev,
          generationState: {
            ...prev.generationState,
            currentStep: nextStep,
            status: nextStep < 4 ? "pending" : "running",
          },
        };
      });
    }, 1200);
  };

  const updateGenerationState = (
    updates: Partial<Workflow["generationState"]>,
  ) => {
    if (!currentWorkflow) return;
    setCurrentWorkflow((prev) =>
      prev
        ? {
          ...prev,
          generationState: {
            ...prev.generationState,
            ...updates,
            lastUpdated: new Date(),
          },
        }
        : null
    );
  };

  const handleStartExecution = () => {
    if (!currentWorkflow) return;
    if (currentWorkflow.generationState.status === "completed") {
      updateGenerationState({
        currentStep: 1,
        status: "running",
        isActive: true,
      });
    } else {
      updateGenerationState({
        status: "running",
        isActive: true,
      });
    }

    isExecutingRef.current = true;
    executeSteps();
  };

  const handleStopExecution = () => {
    isExecutingRef.current = false;
    updateGenerationState({
      status: "pending",
      isActive: false,
    });
  };

  //TODO: デモ用なので、修正必須！！！
  const executeSteps = async () => {
    if (!currentWorkflow) return;
    const startStep = currentWorkflow.generationState.currentStep;

    for (let step = startStep; step <= 8; step++) {
      if (!isExecutingRef.current) break;

      updateGenerationState({
        currentStep: step,
        status: "running",
        isActive: true,
      });

      const delay = step === 6 ? 3000 : 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (isExecutingRef.current) {
      updateGenerationState({
        status: "completed",
        isActive: false,
      });
    }

    isExecutingRef.current = false;
  };

  useEffect(() => {
    if (currentWorkflow) {
      isExecutingRef.current = currentWorkflow.generationState.isActive;
    }
  }, [currentWorkflow?.generationState.isActive]);

  const tabs = [
    {
      id: "canvas" as TabType,
      label: "ワークフロー",
      icon: <WorkflowIcon className="w-4 h-4" />,
    },
    {
      id: "plugins" as TabType,
      label: "プラグイン管理",
      icon: <Puzzle className="w-4 h-4" />,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "canvas":
        if (!currentWorkflow) return null;
        return <WorkflowCanvas workflow={currentWorkflow} />;
      case "plugins":
        return <PluginManager />;
      default:
        if (!currentWorkflow) return null;
        return <WorkflowCanvas workflow={currentWorkflow} />;
    }
  };

  if (!currentWorkflow) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-200">
        <div className="w-full max-w-2xl p-8 text-center">
          <Bot className="w-16 h-16 mx-auto text-primary mb-6" />
          <h1 className="text-4xl font-bold mb-4">
            どのようなワークフローを作成しますか？
          </h1>
          <p className="text-lg text-base-content/70 mb-8">
            実現したいことを自然言語で入力してください。AIが自動でワークフローを生成します。
          </p>
          <div className="join w-full">
            <textarea
              className="textarea join-item textarea-bordered w-full"
              placeholder="例: 家計簿ファイルをドキュメントフォルダから探してメールで送信"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            onClick={handleGenerateWorkflow}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? "生成中..." : "ワークフローを生成"}
          </Button>
        </div>
      </div>
    );
  }

  const shouldShowSidebar = activeTab === "canvas";
  const shouldShowFooter = activeTab === "canvas";

  return (
    <div className="flex h-screen bg-base-100">
      <div className="flex-1 flex flex-col">
        <div className="navbar bg-base-100 shadow-sm">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">
              Floorp OS - Sapphillon Engine
            </a>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ワークフローを検索"
              className="input input-bordered w-24 md:w-auto"
            />
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <Settings />
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a>Floorp OS の設定</a>
                </li>
                <li>
                  <a>プラグインの管理</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="tabs tabs-bordered bg-base-200 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab tab-lg gap-2 ${
                activeTab === tab.id ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
        </div>

        {shouldShowFooter && (
          <div className="border-t border-base-300 p-4 flex justify-between">
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <span>最終更新:</span>
              <span>
                {currentWorkflow.updatedAt.toLocaleDateString("ja-JP")}
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="default"
                className="w-auto"
                onClick={handleStopExecution}
                disabled={!currentWorkflow.generationState.isActive}
              >
                中止
              </Button>
              <Button
                variant="primary"
                size="default"
                className="w-auto"
                onClick={handleStartExecution}
                disabled={currentWorkflow.generationState.isActive}
              >
                {currentWorkflow.generationState.isActive
                  ? "実行中..."
                  : "実行"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {shouldShowSidebar && (
        <ExecutionSidebar
          currentStep={currentWorkflow.generationState.currentStep}
          status={currentWorkflow.generationState.status}
        />
      )}
    </div>
  );
}
