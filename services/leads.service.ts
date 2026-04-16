export async function fetchLeads(params?: {
    search?: string;
    status?: string;
    temperature?: string;
    activeStatus?: string;
    assignedTo?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.temperature) query.set('temperature', params.temperature);
    if (params?.activeStatus) query.set('activeStatus', params.activeStatus);
    if (params?.assignedTo) query.set('assignedTo', params.assignedTo);
  
    const response = await fetch(`/api/leads?${query.toString()}`, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch leads');
    const json = await response.json();
    return json?.data ?? json;
  }
  
  export async function fetchLead(id: string) {
    const response = await fetch(`/api/leads/${id}`, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch lead');
    const json = await response.json();
    return json?.data ?? json;
  }
  
  export async function createLead(data: Record<string, unknown>) {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create lead');
    const json = await response.json();
    return json?.data ?? json;
  }
  
  export async function updateLead(id: string, data: Record<string, unknown>) {
    const response = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update lead');
    const json = await response.json();
    return json?.data ?? json;
  }
  
  export async function addComment(leadId: string, content: string, type = 'note') {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, content, type }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    const json = await response.json();
    return json?.data ?? json;
  }
  
  export async function scheduleMeeting(data: {
    leadId: string;
    agenda: string;
    meetingDate: string;
  }) {
    const response = await fetch('/api/meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to schedule meeting');
    const json = await response.json();
    return json?.data ?? json;
  }