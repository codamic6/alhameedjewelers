
'use client';

import Link from 'next/link';
import { Gem, ShoppingCart, User, Menu, Shield, Search as SearchIcon, LogOut, LayoutDashboard, PanelLeft } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAIL } from '@/lib/constants';
import Search from '../Search';
import { Separator } from '../ui/separator';

const topNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/help', label: 'Help' },
  { href: '/faqs', label: 'FAQs' },
];


function HeaderContent() {
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

  if (isDashboard) {
    return (
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
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
    )
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-black backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
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
              <SheetContent side="left" className="bg-black p-4">
                <div className="mb-4">
                     <Link href="/" className="flex items-center gap-2">
                        <Gem className="h-6 w-6 text-primary" />
                        <span className="font-logo font-bold text-xl text-white">Al-Hameed</span>
                      </Link>
                </div>
                <nav className="flex flex-col gap-4">
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
          <Link href="/" className="flex items-center gap-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-logo font-bold text-xl text-white hidden sm:inline">Al-Hameed</span>
          </Link>
          <div className="hidden md:flex gap-6 ml-4">
             <NavLinks />
          </div>
        </div>
        
        <div className="hidden md:flex flex-1 justify-center px-8">
            <Search />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push('/search')}>
              <SearchIcon className="h-5 w-5 text-primary hover:text-accent" />
            </Button>
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
                    <Link href="/dashboard">Dashboard</Link>
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


export default function Header() {
  return <HeaderContent />
}
