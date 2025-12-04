
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2, TicketPercent, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : coupons && coupons.length > 0 ? (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {coupons.map((coupon) => {
                  const status = getStatus(coupon);
                  return (
                    <Card key={coupon.id} className="bg-secondary/50 overflow-hidden">
                      <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
                           <div>
                              <CardTitle className="text-2xl font-bold text-primary">{coupon.discountPercentage}% OFF</CardTitle>
                              <Badge variant="secondary" className="mt-1 font-mono text-base">{coupon.code}</Badge>
                           </div>
                           <Badge className={cn("text-white shrink-0", status.color)}>{status.text}</Badge>
                      </CardHeader>
                      <CardContent className="text-sm space-y-3 px-4 pb-4">
                        <div>
                          <p className="text-muted-foreground text-xs">Valid From</p>
                          <p className="font-medium">{format(coupon.startDate.toDate(), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Valid Until</p>
                          <p className="font-medium">{format(coupon.endDate.toDate(), 'MMM d, yyyy')}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-secondary/20 flex gap-2 p-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(coupon)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(coupon.id)}>
                           <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                 <Card>
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
                </Card>
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
        </div>
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
