import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '@/services/dashboard.service';

export const dashboardQueryKeys = {
  all: ['dashboard'],
};

export function useDashboardQuery(options = {}) {
  return useQuery({
    queryKey: dashboardQueryKeys.all,
    queryFn: fetchDashboard,
    staleTime: 1000 * 60,
    ...options,
  });
}

