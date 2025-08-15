import {
  FileSearch,
  Mail,
  Shell,
  ChevronRight,
  AlertTriangle,
  File,
  Globe,
  AppWindow,
  type LucideIcon,
} from "lucide-react";
import type { WorkflowStep, ResourceType } from "@/types/workflow.d.ts";
import { cn } from "@/lib/utils.ts";

const pluginIcons: Record<string, LucideIcon> = {
  "File System": FileSearch,
  Gmail: Mail,
  Shell: Shell,
  default: Shell,
};

const resourceIcons: Record<ResourceType, LucideIcon> = {
  localFile: File,
  web: Globe,
  application: AppWindow,
};

const getSecurityLevelClass = (step: WorkflowStep): string => {
  const hasAppAccess = step.resourceAccess.some((r) => r.type === "application");
  const hasWebAccess = step.resourceAccess.some((r) => r.type === "web");
  if (hasAppAccess) return "border-error/40";
  if (hasWebAccess) return "border-warning/40";
  return "border-base-300/20";
};

export function WorkflowStepCard({ step }: { step: WorkflowStep }) {
  const PluginIcon = pluginIcons[step.pluginName] ?? pluginIcons.default;

  return (
    <div
      className={cn(
        "card card-compact bg-base-100 border transition-all",
        getSecurityLevelClass(step),
      )}
    >
      <div className="card-body">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <PluginIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-base-content">
              {step.pluginName}: {step.functionName}
            </h3>
            <p className="text-xs text-base-content/70">{step.description}</p>
          </div>
        </div>
        {step.resourceAccess.length > 0 && (
          <div className="mt-2 pl-9">
            <div className="flex items-center gap-2 text-xs text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span>Accessing:</span>
            </div>
            <ul className="list-none pl-2 space-y-1 mt-1">
              {step.resourceAccess.map((resource, i) => {
                const ResourceIcon = resourceIcons[resource.type];
                return (
                  <li key={i} className="flex items-center gap-2 text-xs text-base-content/60 truncate">
                    <ResourceIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate" title={resource.path}>{resource.path}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

