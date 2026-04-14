'use client';

import { useState } from 'react';
import { Eye, EyeOff, EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from '@/queries/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmAlert } from '@/components/common/ConfirmAlert';

type UserData = {
  id: string;
  name: string;
  email: string;
};

type UserActionsProps =
  | { mode: 'create' }
  | { mode: 'row'; user: UserData };

/**
 * Single reusable dialog that handles create, edit, and delete user actions.
 * Keeps all user action UI/behavior centralized to avoid duplicated logic.
 */
export function UserActions(props: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [name, setName] = useState(props.mode === 'row' ? props.user.name : '');
  const [email, setEmail] = useState(props.mode === 'row' ? props.user.email : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (props.mode === 'create') {
        await createMutation.mutateAsync({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        });
      } else {
        await updateMutation.mutateAsync({
          id: props.user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
        });
      }
      setIsOpen(false);
    } catch {}
  }

  const isCreate = props.mode === 'create';
  const isRowActions = props.mode === 'row';

  async function handleDeleteConfirm() {
    if (!isRowActions) return;

    try {
      await deleteMutation.mutateAsync({ id: props.user.id });
      setIsDeleteAlertOpen(false);
    } catch {}
  }

  return (
    <>
      {isCreate ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={isSubmitting}>
              Add user
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
              <DialogDescription>
                Create a new user. They will log in with their email and the password you set.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="user-action-name">Name</Label>
                <Input
                  id="user-action-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-action-email">Email</Label>
                <Input
                  id="user-action-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-action-password">Password</Label>
                <div className="relative">
                  <Input
                    id="user-action-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as 'ADMIN' | 'USER')}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || !name.trim() || !email.trim() || password.length < 6}>
                  {isSubmitting ? 'Adding...' : 'Add user'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="User actions">
                <EllipsisVertical className="size-4" />
                <span className="sr-only">User actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  if (isRowActions) {
                    setName(props.user.name);
                    setEmail(props.user.email);
                  }
                  setIsOpen(true);
                }}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  setIsDeleteAlertOpen(true);
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (open && isRowActions) {
                setName(props.user.name);
                setEmail(props.user.email);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit user</DialogTitle>
                <DialogDescription>Update name and email for this user.</DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="user-action-name">Name</Label>
                  <Input
                    id="user-action-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-action-email">Email</Label>
                  <Input
                    id="user-action-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting || !name.trim() || !email.trim()}>
                    {isSubmitting ? 'Saving...' : 'Save changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {isRowActions ? (
        <ConfirmAlert
          open={isDeleteAlertOpen}
          onOpenChange={setIsDeleteAlertOpen}
          title="Confirm delete"
          description="Are you sure you want to delete this user? This action cannot be undone."
          confirmText={isSubmitting ? 'Deleting...' : 'Delete user'}
          isLoading={isSubmitting}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </>
  );
}
