
'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { deleteDoc, doc } from "firebase/firestore";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore } from '@/firebase';

type ProductCardActionsProps = {
    product: Product;
};

export default function ProductCardActions({ product }: ProductCardActionsProps) {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleEditClick = () => {
        router.push(`/dashboard/admin/products/edit/${product.id}`);
    };

    const handleDeleteClick = async () => {
        if (!firestore) return;
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteDoc(doc(firestore, 'products', product.id));
                toast({ title: "Product Deleted", description: "The product has been successfully deleted." });
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Error", description: error.message });
            }
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" className="w-full" onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" size="sm" className="w-full" onClick={handleDeleteClick}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
        </>
    );
}
