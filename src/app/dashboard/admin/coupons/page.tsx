'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2, TicketPercent, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import type { Coupon } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CouponForm from './CouponForm';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';

export default function AdminCouponsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  const couponsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'coupons') : null),
    [firestore]
  );
  const { data: coupons, isLoading } = useCollection<Coupon>(couponsCollection);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(undefined);

  const handleEdit = (coupon: Coupon) => {
    if (isMobile) {
      router.push(`/dashboard/admin/coupons/edit/${coupon.id}`);
    } else {
      setSelectedCoupon(coupon);
      setDialogOpen(true);
    }
  };

  const handleAdd = () => {
    if (isMobile) {
      router.push('/dashboard/admin/coupons/new');
    } else {
      setSelectedCoupon(undefined);
      setDialogOpen(true);
    }
  };

  const handleDelete = async (couponId: string) => {
     if (!firestore) return;
     if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
        try {
            await deleteDoc(doc(firestore, 'coupons', couponId));
            toast({ title: "Coupon Deleted", description: "The coupon has been successfully deleted."});
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        }
     }
  };

  const getStatus = (coupon: Coupon) => {
    const now = new Date();
    const startDate = coupon.startDate.toDate();
    const endDate = coupon.endDate.toDate();

    if (now < startDate) return { text: 'Scheduled', color: 'bg-blue-500/80' };
    if (now > endDate) return { text: 'Expired', color: 'bg-gray-500/80' };
    return { text: 'Active', color: 'bg-green-600/80' };
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Coupons
            </h1>
            <p className="text-muted-foreground">Create and manage discount codes for your store.</p>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleAdd}
          >
            Add Coupon
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Coupons</CardTitle>
            <CardDescription>
              A list of all coupons available in your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : coupons && coupons.length > 0 ? (
              <>
                 {/* Mobile View */}
                <div className="md:hidden">
                  <Accordion type="single" collapsible className="w-full">
                    {coupons.map((coupon) => {
                      const status = getStatus(coupon);
                      return (
                        <AccordionItem value={coupon.id} key={coupon.id}>
                          <div className="flex items-center justify-between w-full">
                              <AccordionTrigger className="flex-1 hover:no-underline pr-2">
                                  <div className="text-left">
                                    <Badge variant="secondary" className="text-base mb-1">{coupon.code}</Badge>
                                    <p className="text-sm text-muted-foreground">{coupon.discountPercentage}% OFF</p>
                                  </div>
                              </AccordionTrigger>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      aria-haspopup="true"
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Toggle menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                                      Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDelete(coupon.id)}
                                  >
                                      Delete
                                  </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                          <AccordionContent>
                              <div className="text-sm space-y-2 pt-2 border-t border-dashed">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status</span>
                                  <Badge className={cn("text-white", status.color)}>{status.text}</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Valid From</span>
                                  <span>{format(coupon.startDate.toDate(), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Valid Until</span>
                                  <span>{format(coupon.endDate.toDate(), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valid From</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons?.map(coupon => {
                        const status = getStatus(coupon);
                        return (
                          <TableRow key={coupon.id}>
                            <TableCell className="font-medium">
                              <Badge variant="secondary" className="text-base">{coupon.code}</Badge>
                            </TableCell>
                            <TableCell>
                              {coupon.discountPercentage}%
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("text-white", status.color)}>{status.text}</Badge>
                            </TableCell>
                            <TableCell>
                              {format(coupon.startDate.toDate(), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              {format(coupon.endDate.toDate(), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(coupon.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <TicketPercent className="mx-auto h-12 w-12 text-muted-foreground"/>
                    <h3 className="mt-2 text-lg font-semibold text-white">No coupons yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">You haven't created any coupons. Get started by creating your first one.</p>
                    <Button className="mt-4" onClick={handleAdd}>Create Coupon</Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {selectedCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </DialogTitle>
        </DialogHeader>
        <CouponForm
          coupon={selectedCoupon}
          onFinished={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
