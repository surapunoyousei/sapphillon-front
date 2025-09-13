import {
  LuHouse,
  LuInfo,
  LuPlay,
  LuPlugZap,
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
  { path: "/fix", key: "fix", label: "Fix", icon: LuWrench },
  { path: "/run", key: "run", label: "Run", icon: LuPlay },
  { path: "/plugins", key: "plugins", label: "Plugins", icon: LuPlugZap },
  { path: "/about", key: "about", label: "About", icon: LuInfo },
];
