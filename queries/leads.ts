import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeads,
  fetchLead,
  createLead,
  updateLead,
  addComment,
  scheduleMeeting,
} from '@/services/leads.service';

export const leadQueryKeys = {
  all: ['leads'],
  list: (params?: object) => ['leads', 'list', params],
  detail: (id: string) => ['leads', 'detail', id],
};

export function useLeadsQuery(params?: {
  search?: string;
  status?: string;
  temperature?: string;
  activeStatus?: string;
}) {
  return useQuery({
    queryKey: leadQueryKeys.list(params),
    queryFn: () => fetchLeads(params),
    staleTime: 1000 * 30,
  });
}

export function useLeadQuery(id: string) {
  return useQuery({
    queryKey: leadQueryKeys.detail(id),
    queryFn: () => fetchLead(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.all });
    },
  });
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.all });
    },
  });
}

export function useAddComment(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, type }: { content: string; type?: string }) =>
      addComment(leadId, content, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.detail(leadId) });
    },
  });
}

export function useScheduleMeeting(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { agenda: string; meetingDate: string }) =>
      scheduleMeeting({ leadId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.detail(leadId) });
    },
  });
}