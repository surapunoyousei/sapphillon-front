import { useCallback, useMemo, useState } from "react";
import type {
  GenerateWorkflowResponse,
  FixWorkflowResponse,
  GenerateWorkflowRequest,
  FixWorkflowRequest,
} from "@/gen/sapphillon/v1/workflow_service_pb.ts";
import { workflowClient } from "@/lib/grpc-clients.ts";
import { useStreamProgress } from "@/lib/hooks/use-stream-progress.ts";
import type { CodeLine, DiffLine } from "./types.ts";
import {
  serializeWorkflow,
  extractLatestWorkflowCode,
  codeToLines,
  buildSimpleDiff,
} from "./workflow-utils.ts";

export interface UseWorkflowStreamsResult {
  prompt: string;
  setPrompt: (v: string) => void;
  hasGenerated: boolean;
  currentDefinition: string;
  previousDefinition: string;
  currentCode: string;
  previousCode: string;
  codeLines: CodeLine[];
  diffLines: DiffLine[];
  stepCount: number;
  isGenerating: boolean;
  isFixing: boolean;
  errorGenerate?: string;
  errorFix?: string;
  initiate: () => void;
  abortAll: () => void;
  resetAll: () => void;
  generateItems: GenerateWorkflowResponse[];
  fixItems: FixWorkflowResponse[];
  genDefinition: string;
  fixDefinition: string;
}

export function useWorkflowStreams(): UseWorkflowStreamsResult {
  const [prompt, setPrompt] = useState("");
  const generate = useStreamProgress<GenerateWorkflowResponse>({
    extractErrorMessage: (item) =>
      item.status && item.status.code && item.status.code !== 0
        ? item.status.message || "Generation error"
        : undefined,
  });
  const fix = useStreamProgress<FixWorkflowResponse>({
    extractErrorMessage: (item) =>
      item.status && item.status.code && item.status.code !== 0
        ? item.status.message || "Fix error"
        : undefined,
  });

  const genDefinition = useMemo(() => {
    for (let i = generate.items.length - 1; i >= 0; i--) {
      const w = generate.items[i].workflowDefinition;
      if (w) return serializeWorkflow(w);
    }
    return "";
  }, [generate.items]);
  const fixDefinition = useMemo(() => {
    for (let i = fix.items.length - 1; i >= 0; i--) {
      const w = fix.items[i].fixedWorkflowDefinition;
      if (w) return serializeWorkflow(w);
    }
    return "";
  }, [fix.items]);

  const hasGenerated = !!genDefinition;
  const currentDefinition = fixDefinition || genDefinition;
  const previousDefinition =
    generate.items.length > 1
      ? serializeWorkflow(
          generate.items[generate.items.length - 2].workflowDefinition
        )
      : "";
  const currentCode = useMemo(
    () => extractLatestWorkflowCode(currentDefinition),
    [currentDefinition]
  );
  const previousCode = useMemo(
    () => extractLatestWorkflowCode(previousDefinition),
    [previousDefinition]
  );
  const codeLines = useMemo(() => codeToLines(currentCode), [currentCode]);
  const diffLines = useMemo(
    () => buildSimpleDiff(previousCode, currentCode),
    [previousCode, currentCode]
  );
  const stepCount = codeLines.length;

  const initiate = useCallback(() => {
    if (!prompt.trim()) return;
    if (!hasGenerated) {
      generate.start(() =>
        workflowClient.generateWorkflow({ prompt } as GenerateWorkflowRequest)
      );
    } else if (genDefinition) {
      const fixReq = {
        workflowDefinition: genDefinition,
        description: prompt,
      } as FixWorkflowRequest;
      fix.start(() => workflowClient.fixWorkflow(fixReq));
    }
  }, [prompt, hasGenerated, genDefinition, generate, fix]);

  const abortAll = useCallback(() => {
    if (generate.isStreaming) generate.abort();
    if (fix.isStreaming) fix.abort();
  }, [generate, fix]);
  const resetAll = useCallback(() => {
    abortAll();
    generate.reset();
    fix.reset();
    setPrompt("");
  }, [abortAll, generate, fix]);

  return {
    prompt,
    setPrompt,
    hasGenerated,
    currentDefinition,
    previousDefinition,
    currentCode,
    previousCode,
    codeLines,
    diffLines,
    stepCount,
    isGenerating: generate.isStreaming,
    isFixing: fix.isStreaming,
    errorGenerate: generate.error ?? undefined,
    errorFix: fix.error ?? undefined,
    initiate,
    abortAll,
    resetAll,
    generateItems: generate.items,
    fixItems: fix.items,
    genDefinition,
    fixDefinition,
  };
}
