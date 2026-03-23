import { LayoutDashboard, Users, Settings } from "lucide-react";

/**
 * Returns navigation config for the admin layout.
 * @param {Record<string, unknown> | null} user - Current session user or null
 */
export function getCurrentAppConfig(user: unknown) {
  const baseUrl = "/admin";

  const defaultRoutes = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
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

