'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Package, Shield, Home, ShoppingCart, Users, TicketPercent, LayoutGrid, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/firebase';
import { ADMIN_EMAIL } from '@/lib/constants';

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
  const { user, isUserLoading } = useUser();
  const isAdmin = user?.email === ADMIN_EMAIL;


  const renderNav = (items: typeof mainNav | typeof adminNav) => (
    <TooltipProvider>
      <nav className="grid items-start gap-1 px-2 text-sm font-medium">
        {items.map(({ href, label, icon: Icon, exact=false }) => (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  (exact ? pathname === href : pathname.startsWith(href)) && 'bg-muted text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1 overflow-y-auto pt-8">
          <div className="py-4">
            <h3 className="mx-4 mb-2 px-2 text-lg font-semibold tracking-tight">Account</h3>
            {renderNav(mainNav)}
          </div>
          {!isUserLoading && isAdmin && (
            <div className="py-4">
              <h3 className="mx-4 mb-2 px-2 text-lg font-semibold tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin
              </h3>
              {renderNav(adminNav)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
