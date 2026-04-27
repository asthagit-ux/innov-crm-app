import { useQuery } from '@tanstack/react-query';
import { fetchMeetings } from '@/services/meetings.service';

export const meetingsQueryKeys = {
  all: ['meetings'],
};

export function useMeetingsQuery() {
  return useQuery({
    queryKey: meetingsQueryKeys.all,
    queryFn: fetchMeetings,
    staleTime: 1000 * 30,
  });
}
