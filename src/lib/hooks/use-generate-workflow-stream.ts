import { useCallback, useRef, useState } from "react";
import { createMockWorkflowClient } from "@/lib/mock/sapphillon-client.ts";
import type {
  GenerateWorkflowRequest,
  GenerateWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb.ts";

interface UseGenerateWorkflowStreamOptions {
  onPartial?: (
    r: GenerateWorkflowResponse,
    all: GenerateWorkflowResponse[]
  ) => void;
  onError?: (err: Error) => void;
  onComplete?: (final: GenerateWorkflowResponse[], aborted: boolean) => void;
}

export function useGenerateWorkflowStream(
  opts: UseGenerateWorkflowStreamOptions = {}
) {
  const clientRef = useRef(createMockWorkflowClient());
  const [responses, setResponses] = useState<GenerateWorkflowResponse[]>([]);
  const [currentDefinition, setCurrentDefinition] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<boolean>(false);

  const start = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isStreaming) return;
      setResponses([]);
      setCurrentDefinition("");
      setError(null);
      setIsStreaming(true);
      abortRef.current = false;

      try {
        const iterable = clientRef.current.generateWorkflow({
          prompt,
        } as GenerateWorkflowRequest);
        const collected: GenerateWorkflowResponse[] = [];
        for await (const part of iterable) {
          if (abortRef.current) break;
          collected.push(part);
          setResponses([...collected]);
          if (part.workflowDefinition) {
            setCurrentDefinition(part.workflowDefinition);
          }
          if (part.status && part.status.code && part.status.code !== 0) {
            setError(part.status.message || "Generation error");
            opts.onError?.(
              new Error(part.status.message || "Generation error")
            );
            break;
          }
          opts.onPartial?.(part, collected);
        }
        setIsStreaming(false);
        opts.onComplete?.(collected, abortRef.current);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setIsStreaming(false);
        opts.onError?.(new Error(msg));
      }
    },
    [isStreaming, opts]
  );

  const abort = useCallback(() => {
    if (!isStreaming) return;
    abortRef.current = true;
    setIsStreaming(false);
  }, [isStreaming]);

  const reset = useCallback(() => {
    abortRef.current = false;
    setResponses([]);
    setCurrentDefinition("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    start,
    abort,
    reset,
    isStreaming,
    responses,
    currentDefinition,
    error,
  };
}
