import { Sparkles } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder.tsx";

export function Generate() {
  return (
    <PagePlaceholder
      title="Generate Workflow"
      description="Create new workflows using AI-powered natural language generation."
      icon={<Sparkles size={24} />}
      comingSoon
    >
      {/* AI workflow generation interface will go here */}
    </PagePlaceholder>
  );
}
