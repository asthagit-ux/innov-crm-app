import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, Settings, UserCheck } from "lucide-react";

export type NavSubItem = {
  title: string;
  href: string;
};

export type NavMainItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: NavSubItem[];
};

export function getCurrentAppConfig(user: unknown) {
  const baseUrl = "/admin";
  const defaultRoutes: { navMain: NavMainItem[] } = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Leads",
        url: "/leads",
        icon: UserCheck,
      },
      {
        title: "Users",
        url: "/users",
        icon: Users,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  };
  return {
    baseUrl,
    routes: defaultRoutes,
    user,
  };
}
     
