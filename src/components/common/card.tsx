import { cn } from "../../lib/utils.ts";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-base-300/50 bg-base-100/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "p-4 border-base-300/20",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h2
      className={cn("card-title text-base-content/90 font-medium", className)}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ children, className }: CardProps) {
  return (
    <p className={cn("text-base-content/60 text-sm", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn("card-body pt-0 pb-2 px-4 mb-2", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "flex card-body pt-0 px-4 border-t border-base-300/20 bg-base-200/30 dark:bg-base-200/10 justify-end",
        className,
      )}
      role="contentinfo"
      aria-label="Card footer"
    >
      {children}
    </div>
  );
}
