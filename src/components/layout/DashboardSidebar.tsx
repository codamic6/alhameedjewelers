
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, Package, Shield, Home, ShoppingCart, Users, TicketPercent, LayoutGrid, Heart, Gem, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useUser as useFirebaseUser } from '@/firebase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export const mainNav = [
  { href: '/dashboard/account', label: 'My Account', icon: Settings },
  { href: '/dashboard/orders', label: 'My Orders', icon: Package },
  { href: '/dashboard/favorites', label: 'My Favorites', icon: Heart },
];

export const adminNav = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: Home, exact: true },
  { href: '/dashboard/admin/products', label: 'Products', icon: ShoppingCart },
  { href: '/dashboard/admin/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/dashboard/admin/orders', label: 'Orders', icon: Package },
  { href: '/dashboard/admin/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/admin/coupons', label: 'Coupons', icon: TicketPercent },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useFirebaseUser();
  const auth = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout Error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred during logout. Please try again.',
      });
    }
  };

  const renderNav = (items: typeof mainNav | typeof adminNav) => (
    <nav className="grid items-start gap-1 text-sm font-medium">
      {items.map(({ href, label, icon: Icon, exact = false }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-hover hover:text-sidebar-hover-foreground',
            (exact ? pathname === href : pathname.startsWith(href)) && 'bg-sidebar-active text-sidebar-active-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <aside className="hidden md:block bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-logo text-xl">Al-Hameed</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="py-4 px-2">
            <h3 className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground/80">Account</h3>
            {renderNav(mainNav)}
          </div>
          {!isUserLoading && isAdmin && (
            <div className="py-4 px-2">
              <h3 className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Admin
              </h3>
              {renderNav(adminNav)}
            </div>
          )}
        </div>
        <div className="mt-auto border-t border-sidebar-border p-4">
          {user && (
            <div className="flex items-center gap-3">
              <User className="h-10 w-10 rounded-full bg-sidebar-active p-2 text-sidebar-active-foreground" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{user.displayName || user.email}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
