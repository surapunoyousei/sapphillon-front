import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMockVersionClient,
  createMockWorkflowClient,
} from "../mock/sapphillon-client.ts";
import type {
  FixWorkflowRequest,
  FixWorkflowResponse,
  GenerateWorkflowRequest,
  GenerateWorkflowResponse,
} from "@/gen/sapphillon/v1/workflow_service_pb.ts";
import type { GetVersionRequest } from "@/gen/sapphillon/v1/version_pb.ts";

/**
 * Custom hook for version API operations
 */
export function useVersion() {
  const client = createMockVersionClient();

  return useQuery({
    queryKey: ["version"],
    queryFn: async () => {
      const response = await client.getVersion({} as GetVersionRequest);
      return response.version?.version ?? "Unknown";
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

/**
 * Custom hook for workflow generation
 */
export function useGenerateWorkflow() {
  const client = createMockWorkflowClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: GenerateWorkflowRequest) => {
      const responses: GenerateWorkflowResponse[] = [];

      for await (const response of client.generateWorkflow(request)) {
        responses.push(response);
      }

      return responses;
    },
    onSuccess: () => {
      // Invalidate workflow-related queries
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}

/**
 * Custom hook for workflow fixing
 */
export function useFixWorkflow() {
  const client = createMockWorkflowClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: FixWorkflowRequest) => {
      const responses: FixWorkflowResponse[] = [];

      for await (const response of client.fixWorkflow(request)) {
        responses.push(response);
      }

      return responses;
    },
    onSuccess: () => {
      // Invalidate workflow-related queries
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}

/**
 * Custom hook for BrowserOS API operations
 */
export function useBrowserOS() {
  return useQuery({
    queryKey: ["browser-os-status"],
    queryFn: async () => {
      try {
        const { getBrowserOS } = await import("../browser-os.ts");
        const api = getBrowserOS();
        const data = await api.getAllContextData({
          historyLimit: 5,
          downloadLimit: 5,
        });
        return {
          available: true,
          data: data ? JSON.parse(data) : null,
        };
      } catch (error) {
        return {
          available: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}
