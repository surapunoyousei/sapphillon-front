import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { PagePlaceholder } from "@/components/layout/page-placeholder.tsx";
import { Card, CardContent } from "@/components/common/card.tsx";

interface WorkflowPageWrapperProps {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
  showWorkflowId?: boolean;
  workflowIdVariant?: "info" | "warning" | "success" | "error";
  workflowIdLabel?: string;
}

/**
 * Wrapper component for workflow-related pages
 * Handles common patterns like ID display and consistent layout
 */
export function WorkflowPageWrapper({
  title,
  description,
  icon,
  children,
  showWorkflowId = false,
  workflowIdVariant = "info",
  workflowIdLabel = "Workflow ID",
}: WorkflowPageWrapperProps) {
  const { id } = useParams<{ id: string }>();

  const variantStyles = {
    info: "bg-info/10 border-info/20 text-info",
    warning: "bg-warning/10 border-warning/20 text-warning",
    success: "bg-success/10 border-success/20 text-success",
    error: "bg-error/10 border-error/20 text-error",
  };

  return (
    <PagePlaceholder
      title={`${title}${id ? ` #${id}` : ""}`}
      description={description}
      icon={icon}
      comingSoon
    >
      {children}

      {showWorkflowId && id && (
        <Card className={`mt-4 ${variantStyles[workflowIdVariant]}`}>
          <CardContent className="pt-6">
            <p
              className={`text-sm ${
                variantStyles[workflowIdVariant].split(" ")[2]
              }`}
            >
              <strong>{workflowIdLabel}:</strong> {id}
            </p>
          </CardContent>
        </Card>
      )}
    </PagePlaceholder>
  );
}
