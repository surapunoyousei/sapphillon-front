import { useCallback, useRef, useState } from "react";
import { createMockWorkflowClient } from "@/lib/mock/sapphillon-client.ts";
import type {
  FixWorkflowRequest,
  FixWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb.ts";

interface UseFixWorkflowStreamOptions {
  onPartial?: (r: FixWorkflowResponse, all: FixWorkflowResponse[]) => void;
  onError?: (err: Error) => void;
  onComplete?: (final: FixWorkflowResponse[], aborted: boolean) => void;
}

export function useFixWorkflowStream(opts: UseFixWorkflowStreamOptions = {}) {
  const clientRef = useRef(createMockWorkflowClient());
  const [responses, setResponses] = useState<FixWorkflowResponse[]>([]);
  const [currentDefinition, setCurrentDefinition] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<boolean>(false);

  const start = useCallback(
    async (req: FixWorkflowRequest) => {
      if (
        !req.workflowDefinition.trim() ||
        !req.description.trim() ||
        isStreaming
      )
        return;
      setResponses([]);
      setError(null);
      setIsStreaming(true);
      abortRef.current = false;

      try {
        const iterable = clientRef.current.fixWorkflow(req);
        const collected: FixWorkflowResponse[] = [];
        for await (const part of iterable) {
          if (abortRef.current) break;
          collected.push(part);
          setResponses([...collected]);
          if (part.fixedWorkflowDefinition) {
            setCurrentDefinition(part.fixedWorkflowDefinition);
          }
          if (part.status && part.status.code && part.status.code !== 0) {
            setError(part.status.message || "Fix error");
            opts.onError?.(new Error(part.status.message || "Fix error"));
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
