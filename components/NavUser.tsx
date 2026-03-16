'use client';

import { getCurrentAppConfig } from '@/config/route';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function NavUser() {
  const user = useAuth();
  const navigationConfig = getCurrentAppConfig(user);

  if (!navigationConfig || !navigationConfig.routes || !navigationConfig.baseUrl) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' asChild>
          <Link href={`${navigationConfig.baseUrl}/dashboard`}>
            <div className='text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600'>
              <LayoutGrid className='size-4' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>Innov CRM</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
