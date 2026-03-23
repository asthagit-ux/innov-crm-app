'use client';

import { useSyncExternalStore } from 'react';
import { getCurrentAppConfig } from '@/config/route';
import { useAuth } from '@/contexts/AuthContext';
import { authClient } from '@/lib/auth-client';
import { parseMessage } from '@/utils/string.utils';
import { Shield, LogOut, ChevronUp, Sun, Moon, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { SidebarMenuButton } from './ui/sidebar';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

const NavFooter = () => {
  const u = useAuth();
  const navigationConfig = getCurrentAppConfig(u);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!navigationConfig || !navigationConfig.routes || !navigationConfig.baseUrl) {
    return null;
  }

  const uSafe = u ?? null;
  const userName = String((uSafe && typeof uSafe === 'object' && 'name' in uSafe ? uSafe.name : null) || 'User');
  const userRole = parseMessage(String((uSafe && typeof uSafe === 'object' && 'role' in uSafe ? uSafe.role : null) ?? 'User'));
  const userInfoRaw = (uSafe && typeof uSafe === 'object' && 'email' in uSafe ? uSafe.email : null)
    ?? (uSafe && typeof uSafe === 'object' && 'phone' in uSafe ? uSafe.phone : null) ?? null;
  const userInfo = userInfoRaw != null ? String(userInfoRaw) : null;

  const handleLogout = async () => {
    toast.success('Logging out...');
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
          router.refresh();
        },
      },
    });
  };

  const getThemeIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case 'light':
        return <Sun className='h-4 w-4 shrink-0' />;
      case 'dark':
        return <Moon className='h-4 w-4 shrink-0' />;
      case 'system':
        return <Monitor className='h-4 w-4 shrink-0' />;
      default:
        return <Sun className='h-4 w-4 shrink-0' />;
    }
  };

  const getThemeLabel = (currentTheme: string) => {
    switch (currentTheme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  const triggerButton = (
    <SidebarMenuButton size='lg'>
      <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
        <Shield className='size-4' />
      </div>
      <div className='grid w-full min-w-0 flex-1 text-left text-sm leading-tight'>
        <div className='flex w-full min-w-0 items-center gap-1'>
          <p className='font-semibold whitespace-nowrap'>{userName}</p>
          {userInfo && <p className='text-muted-foreground w-full min-w-0 truncate text-xs'>({userInfo})</p>}
        </div>
        <span className='text-xs'>{userRole}</span>
      </div>
      <ChevronUp className='text-muted-foreground size-4' />
    </SidebarMenuButton>
  );

  if (!mounted) {
    return (
      <div className='hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-lg p-2'>
        {triggerButton}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className='hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-ring flex w-full items-center gap-2 rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none'
        asChild
      >
        {triggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[240px]'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>{userName}</p>
            {userInfo && <p className='text-muted-foreground text-xs leading-none'>{userInfo}</p>}
            <div className='text-muted-foreground flex items-center gap-1 text-xs leading-none'>
              <Shield className='h-3 w-3' />
              <p>{userRole}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className='cursor-pointer'>
            <div className='flex w-full items-center justify-between'>
              <div className='flex items-center gap-2'>
                {getThemeIcon(theme || 'light')}
                <span>Theme</span>
              </div>
              <span className='text-muted-foreground mr-2 text-xs'>{getThemeLabel(theme || 'light')}</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')} className='cursor-pointer'>
              <Sun className='h-4 w-4' />
              <span>Light</span>
              {theme === 'light' && <div className='bg-primary ml-auto h-2 w-2 rounded-full' />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className='cursor-pointer'>
              <Moon className='h-4 w-4' />
              <span>Dark</span>
              {theme === 'dark' && <div className='bg-primary ml-auto h-2 w-2 rounded-full' />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className='cursor-pointer'>
              <Monitor className='h-4 w-4' />
              <span>System</span>
              {theme === 'system' && <div className='bg-primary ml-auto h-2 w-2 rounded-full' />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className='cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950'
        >
          <LogOut className='h-4 w-4' />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavFooter;
