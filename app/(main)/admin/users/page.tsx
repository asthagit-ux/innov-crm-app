import { UsersOverview } from '@/components/users/UsersOverview';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage platform users',
};

export default function UsersPage() {
  return <UsersOverview />;
}
