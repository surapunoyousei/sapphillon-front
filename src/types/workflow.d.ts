export type ResourceType = "localFile" | "web" | "application";

export interface WorkflowStep {
  id: string;
  pluginName: string;
  functionName: string;
  description: string;
  arguments: Record<string, unknown>;
  resourceAccess: {
    type: ResourceType;
    path: string;
  }[];
}

export interface Workflow {
  id: string;
  steps: WorkflowStep[];
}
