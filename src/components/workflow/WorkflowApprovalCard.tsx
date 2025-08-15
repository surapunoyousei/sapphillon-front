import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Edit,
  Play,
  Trash2,
} from "lucide-react";
import type { Workflow } from "@/types/workflow.d.ts";
import { WorkflowStepCard } from "./WorkflowStepCard.tsx";
import { Button } from "@/components/common/button.tsx";

// モックデータ
const mockWorkflow: Workflow = {
  id: "wf-123",
  steps: [
    {
      id: "step-1",
      pluginName: "File System",
      functionName: "searchFiles",
      description: "Finds the latest sales report in your Documents folder.",
      arguments: { query: "Q3 Sales Report.docx", in: "~/Documents" },
      resourceAccess: [{ type: "localFile", path: "~/Documents" }],
    },
    {
      id: "step-2",
      pluginName: "Gmail",
      functionName: "sendMail",
      description: "Emails the found report to the sales team.",
      arguments: {
        to: "sales-team@example.com",
        subject: "Latest Sales Report",
      },
      resourceAccess: [{ type: "web", path: "https://mail.google.com" }],
    },
    {
      id: "step-3",
      pluginName: "Shell",
      functionName: "execute",
      description: "Runs a cleanup script after sending.",
      arguments: { command: "cleanup.sh" },
      resourceAccess: [{ type: "application", path: "/bin/bash" }],
    },
  ],
};

export function WorkflowApprovalCard() {
  const [workflow] = useState<Workflow>(mockWorkflow);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleExecute = () => console.log("Executing workflow:", workflow.id);
  const handleEdit = () => console.log("Editing workflow:", workflow.id);
  const handleDiscard = () => console.log("Discarding workflow:", workflow.id);

  return (
    <div className="card bg-base-200/50 border border-base-300/20 shadow-lg max-w-2xl mx-auto">
      <div className="card-body p-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="card-title text-base font-semibold">
            Generated Workflow
          </h2>
          <button className="btn btn-ghost btn-sm btn-circle">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-col gap-2">
              {workflow.steps.map((step, index) => (
                <>
                  <WorkflowStepCard key={step.id} step={step} />
                  {index < workflow.steps.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowRight className="h-5 w-5 text-base-content/40 my-1" />
                    </div>
                  )}
                </>
              ))}
            </div>
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <Button size="sm" variant="light" onClick={handleDiscard}>
            <Trash2 size={16} className="mr-1" />
            Discard
          </Button>
          <Button size="sm" variant="light" onClick={handleEdit}>
            <Edit size={16} className="mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="primary" onClick={handleExecute}>
            <Play size={16} className="mr-1" />
            Execute
          </Button>
        </div>
      </div>
    </div>
  );
}
