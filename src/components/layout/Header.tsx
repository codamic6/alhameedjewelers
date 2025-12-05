'use client';

import Link from 'next/link';
import { Gem, ShoppingCart, User, Menu, X, Shield, Search as SearchIcon, LogOut, LayoutDashboard, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAIL } from '@/lib/constants';
import Search from '../Search';
import { mainNav, adminNav } from './DashboardSidebar';
import { Separator } from '../ui/separator';

const topNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/help', label: 'Help' },
  { href: '/faqs', label: 'FAQs' },
];

export default function Header() {
  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const isDashboard = pathname.startsWith('/dashboard');

  useEffect(() => {
    if (user) {
      setIsAdmin(user.email === ADMIN_EMAIL);
    } else {
      setIsAdmin(false);
    }
  }, [user]);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <>
      {topNavLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'font-medium transition-colors hover:text-primary',
            'font-body',
            pathname === link.href ? 'text-primary' : 'text-white',
            inSheet ? 'text-lg py-2' : 'text-sm',
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
  
  const DashboardMobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 bg-sidebar border-sidebar-border">
        <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-logo text-xl">Al-Hameed</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start gap-1 p-4 text-sm font-medium">
            <h3 className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground/80">Account</h3>
            {mainNav.map(item => (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-hover hover:text-sidebar-hover-foreground", pathname.startsWith(item.href) && "bg-sidebar-active text-sidebar-active-foreground")}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Separator className="my-2 bg-sidebar-border" />
                <h3 className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground/80 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin
                </h3>
                {adminNav.map(item => (
                  <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-hover hover:text-sidebar-hover-foreground", (item.exact ? pathname === item.href : pathname.startsWith(item.href)) && "bg-sidebar-active text-sidebar-active-foreground")}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
        <div className="mt-auto border-t border-sidebar-border p-4">
          {user && (
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 rounded-full bg-sidebar-active p-1.5 text-sidebar-active-foreground" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.displayName || user.email}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-black backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
           {isDashboard ? (
             <DashboardMobileNav />
           ) : (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Toggle mobile menu"
                >
                  <Menu className="h-5 w-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <nav className="flex flex-col gap-4 p-4">
                  <NavLinks inSheet={true} />
                  <Separator className="bg-border/50 my-2" />
                   {user ? (
                      <>
                      <Link href="/dashboard" className="flex items-center gap-3 py-2 text-white transition-all hover:text-primary w-full text-lg">
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                      </Link>
                      {isAdmin && (
                          <Link href="/dashboard/admin" className="flex items-center gap-3 py-2 text-white transition-all hover:text-primary w-full text-lg">
                              <Shield className="h-5 w-5" />
                              Admin Panel
                          </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-3 py-2 text-white transition-all hover:text-primary w-full text-left text-lg">
                          <LogOut className="h-5 w-5" />
                          Logout
                      </button>
                      </>
                  ) : (
                      <>
                      <Link href="/login" className="flex items-center gap-3 py-2 text-white transition-all hover:text-primary w-full text-lg">
                          Log In
                      </Link>
                      <Link href="/signup" className="flex items-center gap-3 py-2 text-white transition-all hover:text-primary w-full text-lg">
                          Sign Up
                      </Link>
                      </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
           )}
          <Link href="/" className="flex items-center gap-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-logo font-bold text-xl text-white hidden sm:inline">Al-Hameed</span>
          </Link>
          <div className="hidden md:flex gap-6 ml-4">
             {!isDashboard && <NavLinks />}
          </div>
        </div>
        
        {!isDashboard && (
          <div className="hidden md:flex flex-1 justify-center px-8">
            <Search />
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {!isDashboard && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push('/search')}>
              <SearchIcon className="h-5 w-5 text-primary hover:text-accent" />
            </Button>
          )}
          <Link href="/cart">
            <Button variant="ghost" size="icon" aria-label="Open cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-primary hover:text-accent" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User account">
                <User className="h-5 w-5 text-primary hover:text-accent" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders">Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/admin">
                        <Shield className="mr-2 h-4 w-4" /> Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Log In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
