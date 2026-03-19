import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
};

export default async function DashboardPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <DashboardOverview />
    </div>
  );
}

