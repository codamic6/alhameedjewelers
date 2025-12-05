
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, Package, Shield, Home, ShoppingCart, Users, TicketPercent, LayoutGrid, Heart, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useUser as useFirebaseUser } from '@/firebase';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';

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
  const { state } = useSidebar();

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

  const renderNav = (items: typeof mainNav | typeof adminNav, isMobile: boolean = false) => (
    <SidebarMenu>
      {items.map(({ href, label, icon: Icon, exact = false }) => (
        <SidebarMenuItem key={href}>
          <Link href={href}>
            <SidebarMenuButton
              isActive={exact ? pathname === href : pathname.startsWith(href)}
              tooltip={label}
            >
              <Icon />
              <span>{label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
      <Sidebar collapsible="icon" className="hidden md:flex">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            {renderNav(mainNav)}
          </SidebarGroup>
          {!isUserLoading && isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Shield /> Admin
              </SidebarGroupLabel>
              {renderNav(adminNav)}
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          {user && (
            <div className="flex items-center gap-2">
              <UserIcon className={cn("h-8 w-8 rounded-full bg-sidebar-active p-1.5 text-sidebar-active-foreground", state === 'collapsed' && 'h-10 w-10')} />
              <div className={cn("flex-1 overflow-hidden transition-opacity duration-200", state === 'collapsed' && 'opacity-0 w-0')}>
                <p className="truncate text-sm font-medium">{user.displayName || user.email}</p>
              </div>
               <Button variant="ghost" size="icon" onClick={handleLogout} className={cn("transition-opacity duration-200", state === 'collapsed' && 'opacity-0 w-0')}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
  );
}
