import type {
  GenerateWorkflowResponse,
  FixWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb.ts";

export interface CodeLine {
  number: number;
  text: string;
}
export interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
}

export interface PromptPanelProps {
  prompt: string;
  setPrompt: (v: string) => void;
  autoScrollLog: boolean;
  setAutoScrollLog: (v: boolean) => void;
  hasGenerated: boolean;
  isGenerating: boolean;
  isFixing: boolean;
  initiate: () => void;
  abortAll: () => void;
}

export interface StreamLogProps {
  generateItems: GenerateWorkflowResponse[];
  fixItems: FixWorkflowResponse[];
  errorGenerate?: string;
  errorFix?: string;
  isGenerating: boolean;
  isFixing: boolean;
  autoScrollLog: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}

export interface StepsViewProps {
  codeLines: CodeLine[];
}
export interface DiffViewProps {
  diffLines: DiffLine[];
}
