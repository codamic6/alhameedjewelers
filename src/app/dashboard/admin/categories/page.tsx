
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
import { MoreHorizontal, Loader2, Edit, Trash2, LayoutGrid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CategoryForm from './CategoryForm';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';

export default function AdminCategoriesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading } = useCollection<Category>(categoriesCollection);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

  const handleEdit = (category: Category) => {
    if (isMobile) {
      router.push(`/dashboard/admin/categories/edit/${category.id}`);
    } else {
      setSelectedCategory(category);
      setDialogOpen(true);
    }
  };

  const handleAdd = () => {
    if (isMobile) {
      router.push('/dashboard/admin/categories/new');
    } else {
      setSelectedCategory(undefined);
      setDialogOpen(true);
    }
  };

  const handleDelete = async (categoryId: string) => {
     if (!firestore) return;
     if (confirm('Are you sure you want to delete this category? This might affect existing products.')) {
        try {
            await deleteDoc(doc(firestore, 'categories', categoryId));
            toast({ title: "Category Deleted", description: "The category has been successfully deleted."});
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
              Categories
            </h1>
            <p className="text-muted-foreground">Manage your product categories.</p>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleAdd}
          >
            Add Category
          </Button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories && categories.length > 0 ? (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {categories.map((category) => (
                    <Card key={category.id} className="bg-secondary/50 overflow-hidden">
                      <CardHeader className="p-4">
                          <CardTitle className="text-lg text-primary">{category.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="bg-secondary/20 flex gap-2 p-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(category.id)}>
                           <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories?.map(category => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">
                              {category.name}
                            </TableCell>
                            <TableCell>
                              {category.description}
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
                                  <DropdownMenuItem onClick={() => handleEdit(category)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(category.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground"/>
              <h3 className="mt-2 text-lg font-semibold text-white">No categories yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">You haven't created any categories. Get started by creating your first one.</p>
              <Button className="mt-4" onClick={handleAdd}>Create Category</Button>
            </div>
          )}
        </div>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>
        <CategoryForm
          category={selectedCategory}
          onFinished={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
