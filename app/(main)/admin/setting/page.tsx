import { Metadata } from 'next';
import { SettingsPage } from '@/components/settings/SettingsPage';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'CRM Settings',
};

export default function Settings() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <SettingsPage />
    </div>
  );
}