'use client';

import { useSyncExternalStore, useState } from 'react';
import { getCurrentAppConfig } from '@/config/route';
import { useAuth } from '@/contexts/AuthContext';
import { authClient } from '@/lib/auth-client';
import { parseMessage } from '@/utils/string.utils';
import { Shield, LogOut, ChevronUp, Sun, Moon, Monitor, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { SidebarMenuButton } from './ui/sidebar';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

const NavFooter = () => {
  const u = useAuth();
  const navigationConfig = getCurrentAppConfig(u);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Failed to change password.');
      } else {
        toast.success('Password changed successfully.');
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setChangingPassword(false);
    }
  };

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

  // ── Mobile: inline expanded layout ──────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* User info */}
        <div className='flex items-center gap-3 rounded-lg px-2 py-2'>
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg'>
            <Shield className='size-4' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold'>{userName}</p>
            {userInfo && <p className='truncate text-xs text-muted-foreground'>{userInfo}</p>}
            <p className='text-xs text-muted-foreground'>{userRole}</p>
          </div>
        </div>

        {/* Divider */}
        <div className='mx-2 h-px bg-sidebar-border' />

        {/* Theme toggle row */}
        <div className='flex gap-1 px-2'>
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors ${
                theme === t
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              {t === 'light' && <Sun className='h-3.5 w-3.5' />}
              {t === 'dark' && <Moon className='h-3.5 w-3.5' />}
              {t === 'system' && <Monitor className='h-3.5 w-3.5' />}
              <span className='capitalize'>{t}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className='mx-2 h-px bg-sidebar-border' />

        {/* Change password */}
        <button
          onClick={() => setShowChangePassword(true)}
          className='flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        >
          <KeyRound className='h-4 w-4 shrink-0' />
          Change password
        </button>

        {/* Logout */}
        <button
          onClick={() => void handleLogout()}
          className='flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10'
        >
          <LogOut className='h-4 w-4 shrink-0' />
          Log out
        </button>

        {/* Change password dialog */}
        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => void handleChangePassword(e)} className='space-y-4 py-2'>
              <div className='space-y-2'>
                <Label>Current Password</Label>
                <div className='relative'>
                  <Input type={showCurrent ? 'text' : 'password'} placeholder='Enter current password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={changingPassword} className='pr-10' />
                  <button type='button' onClick={() => setShowCurrent((p) => !p)} className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground' tabIndex={-1}>
                    {showCurrent ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </button>
                </div>
              </div>
              <div className='space-y-2'>
                <Label>New Password</Label>
                <div className='relative'>
                  <Input type={showNew ? 'text' : 'password'} placeholder='Min. 6 characters' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} disabled={changingPassword} className='pr-10' />
                  <button type='button' onClick={() => setShowNew((p) => !p)} className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground' tabIndex={-1}>
                    {showNew ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </button>
                </div>
              </div>
              <div className='space-y-2'>
                <Label>Confirm New Password</Label>
                <Input type='password' placeholder='Re-enter new password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={changingPassword} />
              </div>
              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => setShowChangePassword(false)} disabled={changingPassword}>Cancel</Button>
                <Button type='submit' disabled={changingPassword || !currentPassword || newPassword.length < 6 || !confirmPassword}>
                  {changingPassword ? 'Saving...' : 'Change Password'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
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
          onSelect={(e) => { e.preventDefault(); setShowChangePassword(true); }}
          className='cursor-pointer'
        >
          <KeyRound className='h-4 w-4' />
          <span>Change password</span>
        </DropdownMenuItem>
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

    <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleChangePassword(e)} className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label>Current Password</Label>
            <div className='relative'>
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder='Enter current password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={changingPassword}
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowCurrent((p) => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
          </div>
          <div className='space-y-2'>
            <Label>New Password</Label>
            <div className='relative'>
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder='Min. 6 characters'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                disabled={changingPassword}
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowNew((p) => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                tabIndex={-1}
              >
                {showNew ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Confirm New Password</Label>
            <Input
              type='password'
              placeholder='Re-enter new password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={changingPassword}
            />
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setShowChangePassword(false)}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={changingPassword || !currentPassword || newPassword.length < 6 || !confirmPassword}
            >
              {changingPassword ? 'Saving...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default NavFooter;
