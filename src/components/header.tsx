import { Bell, Github, Moon, Search, Sun, X } from "lucide-react";
import { Button } from "./common/button.tsx";
import { useTheme } from "./theme-provider.tsx";
import { Avatar, AvatarImage } from "./common/avatar.tsx";
import { SidebarTrigger } from "./common/sidebar.tsx";
import { useState } from "react";

/**
 * Header component that provides navigation, search, theme switching, and user menu
 * Includes responsive design for mobile and desktop layouts with enhanced UX
 */
export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Handle search functionality
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    // TODO: Implement actual search functionality
    console.log("Search query:", query);
    setSearchQuery("");
  };

  // Handle mobile search modal
  const handleMobileSearch = () => {
    // TODO: Implement mobile search modal
    console.log("Open mobile search modal");
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <header
      className="navbar bg-base-200/50 border-b border-base-300/20 sticky top-0 z-40 backdrop-blur-sm shadow-sm"
      role="banner"
      aria-label="Main navigation"
    >
      {/* Left section - Sidebar trigger only */}
      <div className="navbar-start">
        <SidebarTrigger />
      </div>

      {/* Center section - Enhanced search bar (desktop only) */}
      <div className="navbar-center hidden lg:flex w-full max-w-2xl mx-auto">
        <div className="form-control w-full relative">
          <div
            className={`join w-full transition-all duration-300 ${
              isSearchFocused ? "ring-2 ring-primary/30 shadow-lg" : ""
            }`}
          >
            <input
              type="text"
              placeholder="Search Floorp OS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm join-item w-full pr-12 focus:outline-none"
              aria-label="Search field"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                } else if (e.key === "Escape") {
                  clearSearch();
                  e.currentTarget.blur();
                }
              }}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="btn btn-ghost btn-xs btn-circle hover:bg-base-300/50"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
              <button
                type="button"
                aria-label="Execute search"
                onClick={() => handleSearch(searchQuery)}
                disabled={!searchQuery.trim()}
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right section - Action buttons and user menu */}
      <div className="navbar-end gap-1 sm:gap-2">
        {/* Mobile search button - hidden on desktop */}
        <div className="tooltip tooltip-bottom lg:hidden" data-tip="Search">
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle hover:bg-primary/10 transition-colors"
            aria-label="Open search"
            onClick={handleMobileSearch}
          >
            <Search size={18} />
          </Button>
        </div>

        {/* Theme toggle button with enhanced animation */}
        <div
          className="tooltip tooltip-bottom"
          data-tip={resolvedTheme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"}
        >
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle hover:bg-primary/10 transition-all duration-300 hover:scale-110"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${
              resolvedTheme === "dark" ? "light" : "dark"
            } mode`}
          >
            {resolvedTheme === "dark"
              ? <Sun size={18} className="text-yellow-500" />
              : <Moon size={18} className="text-blue-500" />}
          </Button>
        </div>

        {/* GitHub repository link with hover effect */}
        <div className="tooltip tooltip-bottom" data-tip="View on GitHub">
          <a
            href="https://github.com/Floorp-Projects/Floorp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub repository"
            className="btn btn-ghost btn-sm btn-circle hover:bg-primary/10 hover:scale-105 transition-all duration-200"
          >
            <Github size={18} />
          </a>
        </div>

        {/* Enhanced notifications button with indicator */}
        <div className="tooltip tooltip-bottom" data-tip="Notifications">
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle hover:bg-primary/10 transition-colors relative"
            aria-label="Show notifications"
          >
            <div className="indicator">
              <Bell size={18} />
              <span
                className="badge badge-xs badge-primary indicator-item animate-pulse shadow-sm"
                aria-label="You have new notifications"
              >
                3
              </span>
            </div>
          </Button>
        </div>

        {/* Enhanced user profile dropdown menu */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-primary/30 transition-all duration-200 hover:scale-105"
            aria-label="Open user menu"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <Avatar className="w-8 h-8 ring-2 ring-base-300/50">
              <AvatarImage
                src="https://avatars.githubusercontent.com/u/124599?v=4"
                alt="User avatar"
              />
            </Avatar>
          </div>

          {/* Enhanced dropdown menu content */}
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100/95 backdrop-blur-sm rounded-box w-56 border border-base-300/20"
            role="menu"
            aria-label="User menu"
          >
            <li className="menu-title">
              <span className="text-xs text-base-content/60">User Menu</span>
            </li>
            <li>
              <a
                className="justify-between hover:bg-primary/10 transition-colors rounded-lg"
                role="menuitem"
                href="/profile"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  Profile
                </div>
                <span className="badge badge-success badge-xs">NEW</span>
              </a>
            </li>
            <li>
              <a
                className="hover:bg-primary/10 transition-colors rounded-lg"
                role="menuitem"
                href="/settings"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-info rounded-full"></div>
                  Settings
                </div>
              </a>
            </li>
            <li className="border-t border-base-300/20 mt-1 pt-1">
              <button
                type="button"
                className="text-error hover:bg-error/10 transition-colors w-full text-left rounded-lg flex items-center gap-2"
                role="menuitem"
                onClick={() => {
                  if (confirm("Are you sure you want to logout?")) {
                    // TODO: Implement actual logout functionality
                    console.log("Logout executed");
                  }
                }}
              >
                <div className="w-2 h-2 bg-error rounded-full"></div>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
