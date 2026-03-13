'use client';
import * as React from 'react';
import { AppSidebar } from '@/components/AppSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <AppSidebar>{children}</AppSidebar>
    </>
  );
}
