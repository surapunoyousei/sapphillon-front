import { WorkflowApprovalCard } from "@/components/workflow/WorkflowApprovalCard.tsx";

export function Chat() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chat</h1>
      <p>
        This is the chat page where user and agent interactions will be
        displayed.
      </p>

      {/* For demonstration purposes, the approval card is shown directly */}
      <WorkflowApprovalCard />
    </div>
  );
}
