import {
  Workflow,
  WorkflowConnection,
  WorkflowNode,
  WorkflowGenerationState,
} from "@/types/workflow.ts";
import React from "react";

export function getVisibleNodeCount(
  step: number,
  status: string,
  totalNodeCount: number
): number {
  if (status === "pending" && step <= 3) return 0;
  if (step <= 4) return Math.min(2, totalNodeCount);
  if (step <= 5) return Math.min(4, totalNodeCount);
  if (step <= 6) return totalNodeCount;
  return totalNodeCount;
}

export function getVisibleConnectionCount(
  step: number,
  status: string,
  totalConnectionCount: number
): number {
  if (status === "pending" && step <= 3) return 0;
  if (step <= 4) return Math.min(1, totalConnectionCount);
  if (step <= 5) return Math.min(3, totalConnectionCount);
  if (step <= 6) return totalConnectionCount;
  return totalConnectionCount;
}

export function getConnectionStyle(
  step: number,
  status: string,
  index: number,
  totalConnectionCount: number
): React.CSSProperties {
  const visibleCount = getVisibleConnectionCount(
    step,
    status,
    totalConnectionCount
  );
  const isVisible = index < visibleCount;

  if (!isVisible) return { display: "none" };

  if (step <= 5) {
    return {
      strokeDasharray: "5,5",
      opacity: 0.6,
    };
  }

  if (step <= 6 && status === "running") {
    return {
      opacity: 0.8,
    };
  }

  return {
    opacity: 1,
  };
}

export function getNodeStyle(
  nodeIndex: number,
  visibleNodeCount: number,
  generationState: WorkflowGenerationState
): React.CSSProperties {
  if (nodeIndex >= visibleNodeCount) {
    return { display: "none" };
  }

  if (
    generationState.status === "running" &&
    generationState.currentStep === 4
  ) {
    return {
      animation: `fadeIn 0.5s ease-in-out ${nodeIndex * 0.2}s both`,
    };
  }

  return {};
}

export function shouldShowPlaceholder(
  generationState: WorkflowGenerationState
): boolean {
  return (
    generationState.status === "pending" && generationState.currentStep <= 3
  );
}

export function getPlaceholderMessage(step: number): string {
  if (step <= 1) return "LLMに接続中...";
  if (step === 2) return "プラグインを確認中...";
  if (step === 3) return "データを処理中...";
  return "";
}

export const getGeneratedWorkflowData = (
  prompt: string
): Pick<Workflow, "nodes" | "connections" | "name" | "description"> => {
  const nodes: WorkflowNode[] = [
    {
      id: "node-1",
      label: "ファイル検索",
      type: "plugin",
      pluginId: "local-file-plugin",
      pluginIcon: "Search",
      description: "ドキュメントフォルダから'家計簿'を検索",
    },
    {
      id: "node-2",
      label: "ファイル読み取り",
      type: "plugin",
      pluginId: "local-file-plugin",
      pluginIcon: "FileText",
      description: "見つかったファイルを読み込む",
    },
    {
      id: "node-3",
      label: "LLMで要約",
      type: "llm",
      pluginIcon: "Type",
      description: "ファイルの内容を要約する",
    },
    {
      id: "node-4",
      label: "Googleドキュメントに保存",
      type: "plugin",
      pluginId: "google-drive-plugin",
      pluginIcon: "Cloud",
      description: "要約を新規ドキュメントとして保存",
    },
  ];

  const connections: WorkflowConnection[] = [
    { from: "node-1", to: "node-2" },
    { from: "node-2", to: "node-3" },
    { from: "node-3", to: "node-4" },
  ];

  const name = "家計簿ファイルの要約と保存";
  const description = `「${
    prompt.length > 20 ? prompt.substring(0, 20) + "..." : prompt
  }」から生成`;

  return { name, description, nodes, connections };
};

export const generateWorkflowFromPrompt = async (
  prompt: string
): Promise<Workflow> => {
  console.log(`Generating workflow for prompt: ${prompt}`);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { name, description, nodes, connections } =
    getGeneratedWorkflowData(prompt);

  const newWorkflow: Workflow = {
    id: `wf-${Date.now()}`,
    name,
    description,
    nodes,
    connections,
    generationState: {
      currentStep: 0,
      status: "pending",
      isActive: false,
      lastUpdated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newWorkflow;
};
