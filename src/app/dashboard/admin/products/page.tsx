
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
import { MoreHorizontal, Loader2, Edit, Trash2, ShoppingBag } from 'lucide-react';
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
import type { Product } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProductForm from './ProductForm';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsCollection);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const handleEdit = (product: Product) => {
    if (isMobile) {
      router.push(`/dashboard/admin/products/edit/${product.id}`);
    } else {
      setSelectedProduct(product);
      setDialogOpen(true);
    }
  };

  const handleAdd = () => {
    if (isMobile) {
      router.push('/dashboard/admin/products/new');
    } else {
      setSelectedProduct(undefined);
      setDialogOpen(true);
    }
  };

  const handleDelete = async (productId: string) => {
     if (!firestore) return;
     if (confirm('Are you sure you want to delete this product?')) {
        try {
            await deleteDoc(doc(firestore, 'products', productId));
            toast({ title: "Product Deleted", description: "The product has been successfully deleted."});
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        }
     }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Products
            </h1>
            <p className="text-muted-foreground">Manage your product catalog.</p>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleAdd}
          >
            Add Product
          </Button>
        </div>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products && products.length > 0 ? (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {products.map((product) => {
                  const image = PlaceHolderImages.find(p => p.id === product.imageIds[0]);
                  return (
                    <Card key={product.id} className="bg-secondary/50 overflow-hidden">
                      <div className="flex items-start p-4 gap-4">
                        {image && (
                          <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="80"
                            src={image.imageUrl}
                            width="80"
                            data-ai-hint={image.imageHint}
                          />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg text-primary">{product.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">{product.category}</Badge>
                          <p className="font-semibold text-white mt-2">${product.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <CardFooter className="bg-secondary/20 flex gap-2 p-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(product.id)}>
                           <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                 <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products?.map(product => {
                          const image = PlaceHolderImages.find(
                            img => img.id === product.imageIds[0]
                          );
                          return (
                            <TableRow key={product.id}>
                              <TableCell className="hidden sm:table-cell">
                                {image && (
                                  <Image
                                    alt={product.name}
                                    className="aspect-square rounded-md object-cover"
                                    height="64"
                                    src={image.imageUrl}
                                    width="64"
                                    data-ai-hint={image.imageHint}
                                  />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{product.category}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                ${product.price.toLocaleString()}
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
                                    <DropdownMenuItem onClick={() => handleEdit(product)}>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDelete(product.id)}
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
              </div>
            </>
          ) : (
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground"/>
              <h3 className="mt-2 text-lg font-semibold text-white">No products yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">You haven't added any products. Get started by creating your first one.</p>
              <Button className="mt-4" onClick={handleAdd}>Create Product</Button>
            </div>
          )}
        </div>
      </div>

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {selectedProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          product={selectedProduct}
          onFinished={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
