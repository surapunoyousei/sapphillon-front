import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/common/breadcrumb.tsx";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  className?: string;
}

/**
 * Consistent page header component with breadcrumbs, title, and actions
 * Provides standardized layout for all application pages
 */
export function PageHeader({
  title,
  description,
  icon,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <>
                <BreadcrumbItem key={crumb.label}>
                  {crumb.href
                    ? (
                      <a
                        href={crumb.href}
                        className="text-base-content/60 hover:text-base-content transition-colors"
                      >
                        {crumb.label}
                      </a>
                    )
                    : <BreadcrumbPage>{crumb.label}</BreadcrumbPage>}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}

          {/* Title and Description */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-base-content truncate">
              {title}
            </h1>
            {description && (
              <p className="text-base-content/70 mt-1 text-sm lg:text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
