import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
} from "@/components/common/sidebar.tsx";
import { NavItem } from "./nav-item.tsx";
import { Activity, Bug, LayoutDashboard, Plug, Settings } from "lucide-react";
import { useTheme } from "../theme-provider.tsx";

/**
 * Main application sidebar component
 * Contains all navigation items and branding
 */
export function AppSidebar() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Sidebar className="bg-base-200 shadow-lg border-r border-base-300 min-w-[220px]">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3">
          {resolvedTheme === "dark"
            ? (
              <img
                src="/Floorp_Logo_OS_D_Dark.png"
                alt="Sapphillon"
                className="h-8 w-auto"
              />
            )
            : (
              <img
                src="/Floorp_Logo_OS_C_Light.png"
                alt="Sapphillon"
                className="h-8 w-auto"
              />
            )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {/* Main Navigation */}
          <nav className="mt-2" aria-label="Main navigation">
            <NavItem
              to="/"
              icon={<LayoutDashboard size={22} />}
              label="Home"
              end
            />
            <NavItem
              to="/workflows"
              icon={<Activity size={22} />}
              label="Workflows"
            />
            <NavItem
              to="/plugins"
              icon={<Plug size={22} />}
              label="Plugins"
            />
          </nav>

          {/* Divider */}
          <div className="my-3 border-t border-base-300" role="separator" />

          {/* Secondary Navigation */}
          <nav aria-label="Secondary navigation">
            <NavItem
              to="/settings"
              icon={<Settings size={22} />}
              label="Settings"
            />
            {import.meta.env.DEV && (
              <NavItem
                to="/debug"
                icon={<Bug size={22} />}
                label="Debug"
              />
            )}
          </nav>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
