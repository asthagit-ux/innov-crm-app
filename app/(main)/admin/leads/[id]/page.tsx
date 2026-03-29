import { Metadata } from 'next';
import { LeadDetail } from '@/components/leads/LeadDetails';

export const metadata: Metadata = {
  title: 'Lead Detail',
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-4 md:p-6">
      <LeadDetail id={id} />
    </div>
  );
}