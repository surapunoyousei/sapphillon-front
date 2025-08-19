import { Activity } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder.tsx";

export function WorkflowsManage() {
  return (
    <PagePlaceholder
      title="Workflows"
      description="Manage and create automation workflows for Floorp OS."
      icon={<Activity size={24} />}
      comingSoon
    >
      {/* Workflow management content will go here */}
    </PagePlaceholder>
  );
}
