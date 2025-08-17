import { Edit } from "lucide-react";
import { WorkflowPageWrapper } from "@/components/workflow/workflow-page-wrapper.tsx";

export function EditWorkflow() {
  return (
    <WorkflowPageWrapper
      title="Edit Workflow"
      description="Modify and configure existing workflow settings and steps."
      icon={<Edit size={24} />}
      showWorkflowId
      workflowIdVariant="warning"
      workflowIdLabel="Editing Workflow"
    >
      {/* Workflow editing interface will go here */}
    </WorkflowPageWrapper>
  );
}
