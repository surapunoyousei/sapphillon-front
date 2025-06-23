export type NodeType = "action" | "condition" | "plugin" | "llm";
export type NodeStatus = "completed" | "active" | "pending" | "error";
export type GenerationStatus = "completed" | "running" | "pending";

export interface WorkflowNode {
  id: string;
  label: string;
  type: NodeType;
  status?: NodeStatus;
  hasError?: boolean;
  pluginId?: string;
  pluginIcon?: string;
  description?: string;
}

export interface WorkflowConnection {
  from: string;
  to: string;
  label?: string;
}

export interface WorkflowGenerationState {
  currentStep: number;
  status: GenerationStatus;
  isActive: boolean;
  lastUpdated: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  generationState: WorkflowGenerationState;
  createdAt: Date;
  updatedAt: Date;
}
