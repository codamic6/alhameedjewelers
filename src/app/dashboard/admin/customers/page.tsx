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
import { Loader2, Mail, Phone, User } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AdminCustomersPage() {
  const firestore = useFirestore();
  const customersCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: customers, isLoading } = useCollection<UserProfile>(customersCollection);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">Customers</h1>
      <p className="text-muted-foreground">View and manage your customer base.</p>

      <div className="mt-6">
         {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
            {customers?.map((customer) => (
                 <Card key={customer.id} className="bg-secondary/50">
                    <CardHeader className="flex flex-row items-center gap-4">
                       <Avatar>
                         <AvatarFallback>{customer.firstName?.[0] || ''}{customer.lastName?.[0] || ''}</AvatarFallback>
                       </Avatar>
                       <div>
                         <CardTitle className="text-lg">{customer.firstName} {customer.lastName}</CardTitle>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4"/>
                            <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4"/>
                            <span>{customer.phone || 'N/A'}</span>
                        </div>
                    </CardContent>
                 </Card>
            ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
            <Card>
                <CardHeader>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>A list of all registered customers.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {customers?.map((customer) => (
                        <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.firstName} {customer.lastName}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

        {!isLoading && (!customers || customers.length === 0) && (
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <User className="mx-auto h-12 w-12 text-muted-foreground"/>
              <h3 className="mt-2 text-lg font-semibold text-white">No customers yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">No users have registered on your site.</p>
            </div>
        )}
      </div>
    </div>
  );
}
