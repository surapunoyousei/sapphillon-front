import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/card.tsx";
import { Button } from "@/components/common/button.tsx";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary component to catch and display JavaScript errors
 * Provides graceful error handling with recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static override getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    globalThis.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="border-error/20 bg-error/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-error">
                <AlertTriangle size={20} />
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred. You can try to recover or reload
                the page.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-base-300/30 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Error Details:</h4>
                  <code className="text-xs text-base-content/80 break-all">
                    {this.state.error.message}
                  </code>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Try Again
                </Button>
                <Button variant="ghost" size="sm" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error display component for inline errors
 */
export function ErrorDisplay({
  error,
  onRetry,
  className,
}: {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className={className}>
      <Card className="border-error/20 bg-error/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-error mb-1">Error</h4>
              <p className="text-sm text-base-content/80">{errorMessage}</p>
              {onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                  className="mt-3 flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
