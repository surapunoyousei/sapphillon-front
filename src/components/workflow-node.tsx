import { cn } from "@/lib/utils.ts";
import { AlertTriangle, Brain, CheckCircle, Loader2, Play } from "lucide-react";
import { NodeStatus, NodeType } from "@/types/workflow.ts";

interface WorkflowNodeProps {
  label: string;
  type: NodeType;
  status?: NodeStatus;
  hasError?: boolean;
  pluginIcon?: string;
  description?: string;
  className?: string;
}

export function WorkflowNode({
  label,
  type = "action",
  status,
  hasError = false,
  pluginIcon,
  description,
  className,
}: WorkflowNodeProps) {
  const isCondition = type === "condition";
  const isPlugin = type === "plugin";
  const isLLM = type === "llm";

  const renderStatusIcon = () => {
    if (hasError) {
      return (
        <div className="absolute -top-2 -right-2 bg-error rounded-full p-1 z-10 shadow-lg">
          <AlertTriangle className="w-3 h-3 text-error-content" />
        </div>
      );
    }

    if (!status || status === "pending") return null;

    if (status === "active") {
      return (
        <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1 z-10 shadow-lg">
          <Loader2 className="w-3 h-3 text-primary-content animate-spin" />
        </div>
      );
    }

    if (status === "completed") {
      return (
        <div className="absolute -top-2 -right-2 bg-success rounded-full p-1 z-10 shadow-lg">
          <CheckCircle className="w-3 h-3 text-success-content" />
        </div>
      );
    }
  };

  return (
    <div className="tooltip" data-tip={description}>
      <div className={cn("relative group", className)}>
        <div
          className={cn(
            "relative bg-base-100 border-2 shadow-sm transition-all duration-200",
            "min-w-[200px] px-6 py-4",
            isCondition ? "transform rotate-45" : "rounded-lg",
            status === "active"
              ? "border-primary shadow-lg shadow-primary/20 bg-primary"
              : status === "completed"
              ? "border-success shadow-md shadow-success/10 bg-success"
              : status === "error" || hasError
              ? "border-error shadow-md shadow-error/10 bg-error"
              : "border-base-300 hover:border-base-400",
            "hover:shadow-md cursor-pointer",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCondition ? "transform -rotate-45" : "",
            )}
          >
            {isPlugin && pluginIcon && (
              <span className="text-2xl filter drop-shadow-sm">
                {pluginIcon}
              </span>
            )}
            {isLLM && (
              <Brain
                className={cn(
                  "w-6 h-6",
                  status === "active" ? "text-primary" : "text-primary/80",
                )}
              />
            )}

            <div className="text-center flex-1">
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  status === "active"
                    ? "text-primary dark:text-primary-content"
                    : status === "completed"
                    ? "text-success dark:text-success-content"
                    : status === "error" || hasError
                    ? "text-error dark:text-error-content"
                    : "text-base-content",
                )}
              >
                {label}
              </p>
            </div>
          </div>

          {renderStatusIcon()}
        </div>

        {hasError && status === "error" && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-error text-error-content rounded-lg px-3 py-1 text-xs whitespace-nowrap shadow-md">
            エラーが発生しました
          </div>
        )}

        {isLLM && (
          <div className="absolute -bottom-2 -left-2 bg-primary text-primary-content rounded-full px-3 py-1 text-xs font-bold shadow-md border-2 border-base-100 dark:border-base-800">
            LLM
          </div>
        )}
        {isPlugin && (
          <div className="absolute -bottom-2 -left-2 bg-secondary text-secondary-content rounded-full px-3 py-1 text-xs font-bold shadow-md border-2 border-base-100 dark:border-base-800">
            Plugin
          </div>
        )}
        {type === "action" && (
          <div className="absolute -bottom-2 -left-2 bg-accent text-accent-content rounded-full px-3 py-1 text-xs font-bold shadow-md border-2 border-base-100 dark:border-base-800">
            Action
          </div>
        )}
        {isCondition && (
          <div className="absolute -bottom-2 -left-2 bg-warning text-warning-content rounded-full px-3 py-1 text-xs font-bold shadow-md border-2 border-base-100 dark:border-base-800">
            Condition
          </div>
        )}
      </div>
    </div>
  );
}
