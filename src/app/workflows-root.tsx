import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils.ts";
import { Activity, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function WorkflowsRoot() {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState<
    { left: number; width: number } | null
  >(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Update underline position on route change / resize
  useEffect(() => {
    const active = containerRef.current?.querySelector<HTMLAnchorElement>(
      "a[data-active='true']",
    );
    if (active) {
      const bounds = active.getBoundingClientRect();
      const parentBounds = containerRef.current!.getBoundingClientRect();
      setIndicatorStyle({
        left: bounds.left - parentBounds.left,
        width: bounds.width,
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => {
      const active = containerRef.current?.querySelector<HTMLAnchorElement>(
        "a[data-active='true']",
      );
      if (active) {
        const bounds = active.getBoundingClientRect();
        const parentBounds = containerRef.current!.getBoundingClientRect();
        setIndicatorStyle({
          left: bounds.left - parentBounds.left,
          width: bounds.width,
        });
      }
    };
    globalThis.addEventListener("resize", handler);
    return () => globalThis.removeEventListener("resize", handler);
  }, []);

  const isGenerate = location.pathname.startsWith("/workflows/generate");
  const isManage = location.pathname === "/workflows";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Subheader bar (stretch full width to align with Header) */}
      <div className="sticky top-14 z-30">
        <nav
          ref={containerRef}
          role="tablist"
          aria-label="Workflow navigation"
          className="relative bg-base-200  flex flex-row gap-1 overflow-x-auto no-scrollbar"
        >
          {/* 管理タブ */}
          <NavLink
            to="/workflows"
            end
            role="tab"
            aria-label="管理"
            aria-description="既存ワークフロー管理"
            className={({ isActive }) =>
              cn(
                "group relative h-10 px-3 inline-flex items-center gap-2 text-sm font-medium rounded-md",
                "transition-colors",
                isActive
                  ? "text-primary"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-300/40",
              )}
            data-active={isManage}
          >
            <span className="flex items-center gap-2">
              <Activity size={14} className="opacity-80" />
              管理
            </span>
          </NavLink>

          {/* 生成タブ */}
          <NavLink
            to="/workflows/generate"
            role="tab"
            aria-label="生成"
            aria-description="ワークフロー生成"
            className={({ isActive }) =>
              cn(
                "group relative h-10 px-3 inline-flex items-center gap-2 text-sm font-medium border border-transparent rounded-md",
                "transition-colors",
                isActive
                  ? "text-primary"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-300/40",
              )}
            data-active={isGenerate}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="opacity-80" />
              生成
            </span>
          </NavLink>

          {/* Active underline */}
          <span
            aria-hidden
            className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300 rounded-full"
            style={indicatorStyle
              ? { left: indicatorStyle.left, width: indicatorStyle.width }
              : { opacity: 0 }}
          />
        </nav>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
