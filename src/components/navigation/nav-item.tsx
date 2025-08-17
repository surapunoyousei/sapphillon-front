import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils.ts";

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
  className?: string;
}

/**
 * Reusable navigation item component for sidebar
 * Provides consistent styling and active state management
 */
export function NavItem(
  { to, icon, label, end = false, className }: NavItemProps,
) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary",
          isActive
            ? "bg-primary/20 text-primary font-semibold"
            : "text-base-content",
          className,
        )}
      aria-label={`Navigate to ${label}`}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
