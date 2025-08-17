import { Play } from "lucide-react";
import { WorkflowPageWrapper } from "@/components/workflow/workflow-page-wrapper.tsx";

export function Run() {
  return (
    <WorkflowPageWrapper
      title="Run Workflow"
      description="Execute and monitor workflow progress in real-time."
      icon={<Play size={24} />}
      showWorkflowId
      workflowIdVariant="success"
      workflowIdLabel="Executing Workflow"
    >
      {/* Workflow execution interface will go here */}
    </WorkflowPageWrapper>
  );
}
