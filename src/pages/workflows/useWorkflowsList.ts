import React from "react";
import { clients } from "@/lib/grpc-clients";
import type {
  ListWorkflowsRequest,
  ListWorkflowsResponse,
  ListWorkflowsFilter,
  OrderByClause,
} from "@/gen/sapphillon/v1/workflow_service_pb";
import { create } from "@bufbuild/protobuf";
import {
  ListWorkflowsRequestSchema,
  ListWorkflowsFilterSchema,
} from "@/gen/sapphillon/v1/workflow_service_pb";
import { WorkflowLanguage } from "@/gen/sapphillon/v1/workflow_pb";
import type { Workflow } from "@/gen/sapphillon/v1/workflow_pb";

export function useWorkflowsList() {
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(undefined);
  const [pageSize, setPageSize] = React.useState(20);
  const [pageToken, setPageToken] = React.useState<string>("");
  const [nextPageToken, setNextPageToken] = React.useState<string>("");
  const [filter, setFilter] = React.useState<Partial<ListWorkflowsFilter>>({
    displayName: "",
    workflowLanguage: WorkflowLanguage.UNSPECIFIED,
  });
  const [orderBy, setOrderBy] = React.useState<OrderByClause[]>([]);

  const fetchWorkflows = React.useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Build filter if needed
      let filterObj: ListWorkflowsFilter | undefined = undefined;
      if (
        filter.displayName ||
        filter.workflowLanguage !== WorkflowLanguage.UNSPECIFIED
      ) {
        filterObj = create(ListWorkflowsFilterSchema, {
          displayName: filter.displayName || "",
          workflowLanguage:
            filter.workflowLanguage ?? WorkflowLanguage.UNSPECIFIED,
        });
      }

      const request: ListWorkflowsRequest = create(ListWorkflowsRequestSchema, {
        pageSize,
        pageToken: pageToken || undefined,
        filter: filterObj,
        orderBy: orderBy.length > 0 ? orderBy : undefined,
      });

      const response: ListWorkflowsResponse =
        await clients.workflow.listWorkflows(request);

      setWorkflows(response.workflows || []);
      setNextPageToken(response.nextPageToken || "");

      // Check if there's an error in the status
      if (response.status?.code !== 0 && response.status?.code !== undefined) {
        throw new Error(response.status.message || "Failed to fetch workflows");
      }
    } catch (e) {
      setError(e);
      setWorkflows([]);
      console.error("Failed to fetch workflows:", e);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageToken, filter, orderBy]);

  React.useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const refetch = React.useCallback(() => {
    setPageToken("");
    fetchWorkflows();
  }, [fetchWorkflows]);

  const loadNextPage = React.useCallback(() => {
    if (nextPageToken) {
      setPageToken(nextPageToken);
    }
  }, [nextPageToken]);

  // Reset to first page when filters or orderBy change
  React.useEffect(() => {
    if (pageToken) {
      setPageToken("");
    }
  }, [filter, orderBy, pageSize]);

  return {
    workflows,
    loading,
    error,
    pageSize,
    setPageSize,
    pageToken,
    nextPageToken,
    filter,
    setFilter,
    orderBy,
    setOrderBy,
    refetch,
    loadNextPage,
  } as const;
}
