import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Home,
  Puzzle,
  Search,
  Settings,
  User,
  Workflow,
} from "lucide-react";
import { Button } from "./common/button.tsx";
import { Input } from "./common/input.tsx";

export function Header() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      const isDark = theme === "dark" ||
        (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", checkDarkMode);
    };
  }, []);

  const navigationItems = [
    { path: "/", label: "ホーム", icon: Home },
    { path: "/workflows", label: "ワークフロー", icon: Workflow },
    { path: "/plugins", label: "プラグイン", icon: Puzzle },
    { path: "/settings", label: "設定", icon: Settings },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Search query:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300/30 bg-base-100/80 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex h-18 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-52 flex items-center justify-center">
                <img
                  src={isDarkMode
                    ? "/Floorp_Logo_OS_D_Dark.png"
                    : "/Floorp_Logo_OS_C_Light.png"}
                  alt="Floorp OS"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-primary/15 to-secondary/15 text-primary border border-primary/20 shadow-sm"
                      : "text-base-content/70 hover:text-base-content hover:bg-base-200/60 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <div
                className={`flex items-center transition-all duration-300 ${
                  isSearchFocused ? "w-72" : "w-56"
                }`}
              >
                <Search className="absolute left-4 w-4 h-4 text-base-content/50 z-10" />
                <Input
                  type="text"
                  placeholder="操作したい内容を入力..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-12 pr-4 h-10 text-sm bg-base-200/60 border-base-300/40 focus:bg-base-100 focus:border-primary/40 rounded-xl shadow-sm backdrop-blur-sm"
                />
              </div>
            </form>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-xl hover:bg-base-200/60"
            >
              <Bell className="w-4 h-4" />
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-accent via-accent/90 to-accent/70 rounded-xl flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-accent-content" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-base-content">
                  User
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-base-300/30 bg-base-100/90 backdrop-blur-sm">
        <nav className="flex items-center justify-around py-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-200/60"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
