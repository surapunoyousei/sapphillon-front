import {
  LuHouse,
  LuInfo,
  LuPlugZap,
  LuSettings,
  LuSparkles,
  LuWrench,
} from "react-icons/lu";

export type AppRoute = {
  path: string;
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: string | number }>;
};

export const routes: AppRoute[] = [
  { path: "/home", key: "home", label: "Home", icon: LuHouse },
  { path: "/generate", key: "generate", label: "Generate", icon: LuSparkles },
  { path: "/workflows", key: "workflows", label: "Workflows", icon: LuWrench },
  { path: "/plugins", key: "plugins", label: "Plugins", icon: LuPlugZap },
  { path: "/settings", key: "settings", label: "Settings", icon: LuSettings },
  { path: "/about", key: "about", label: "About", icon: LuInfo },
];
