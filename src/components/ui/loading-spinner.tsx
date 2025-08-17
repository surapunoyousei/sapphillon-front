import { cn } from "@/lib/utils.ts";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

/**
 * Reusable loading spinner component with multiple sizes
 * Provides consistent loading states across the application
 */
export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className,
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-primary/30 border-t-primary",
          sizeClasses[size],
        )}
        role="status"
        aria-label={text || "Loading"}
      />
      {text && (
        <span className={cn("text-base-content/70", textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Inline loading state for content areas
 */
export function LoadingContent({
  text = "Loading content...",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}
