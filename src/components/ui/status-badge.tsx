import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "primary"
  | "secondary";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}

/**
 * Versatile status badge component for displaying various states
 * Supports multiple variants, sizes, and animations
 */
export function StatusBadge({
  variant,
  children,
  size = "md",
  className,
  pulse = false,
}: StatusBadgeProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-full";

  const variantClasses = {
    success: "bg-success/20 text-success border border-success/30",
    warning: "bg-warning/20 text-warning border border-warning/30",
    error: "bg-error/20 text-error border border-error/30",
    info: "bg-info/20 text-info border border-info/30",
    neutral: "bg-base-300/50 text-base-content border border-base-300",
    primary: "bg-primary/20 text-primary border border-primary/30",
    secondary: "bg-secondary/20 text-secondary border border-secondary/30",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs h-5",
    md: "px-2.5 py-1 text-sm h-6",
    lg: "px-3 py-1.5 text-base h-8",
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        pulse && "animate-pulse",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Status indicator dot component
 */
export function StatusDot({
  variant,
  size = "md",
  className,
  pulse = false,
}: {
  variant: StatusVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const colorClasses = {
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    info: "bg-info",
    neutral: "bg-base-content/40",
    primary: "bg-primary",
    secondary: "bg-secondary",
  };

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0",
        sizeClasses[size],
        colorClasses[variant],
        pulse && "animate-pulse",
        className,
      )}
    />
  );
}

/**
 * Combined status indicator with dot and text
 */
export function StatusIndicator({
  variant,
  children,
  dotSize = "sm",
  className,
  pulse = false,
}: {
  variant: StatusVariant;
  children: ReactNode;
  dotSize?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StatusDot variant={variant} size={dotSize} pulse={pulse} />
      <span className="text-sm text-base-content">{children}</span>
    </div>
  );
}
