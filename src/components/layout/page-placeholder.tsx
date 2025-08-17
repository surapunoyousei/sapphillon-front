import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/card.tsx";
import { cn } from "@/lib/utils.ts";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  comingSoon?: boolean;
}

/**
 * Reusable placeholder component for pages under development
 * Provides consistent layout and styling across the application
 */
export function PagePlaceholder({
  title,
  description,
  icon,
  children,
  className,
  comingSoon = false,
}: PagePlaceholderProps) {
  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Page Header */}
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            {title}
            {comingSoon && (
              <span className="badge badge-primary badge-sm">Coming Soon</span>
            )}
          </h1>
          <p className="text-base-content/70 mt-1">{description}</p>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title} Overview
          </CardTitle>
          <CardDescription>
            This page is currently under development. {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {children || (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-base-300/50 flex items-center justify-center mb-4">
                {icon || (
                  <svg
                    className="w-12 h-12 text-base-content/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-4.5A1.125 1.125 0 0010.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H5.25m0 9h15M8.25 9.75l3-3m0 0l3 3m-3-3v12"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-base-content/80 mb-2">
                Feature Under Development
              </h3>
              <p className="text-base-content/60 max-w-md">
                We're working hard to bring you this feature. Stay tuned for
                updates!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development Status */}
      {comingSoon && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse">
                </div>
              </div>
              <div>
                <h4 className="font-medium text-base-content mb-1">
                  Development Status
                </h4>
                <p className="text-sm text-base-content/70">
                  This feature is planned for an upcoming release. We're
                  currently designing the user experience and implementing core
                  functionality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
