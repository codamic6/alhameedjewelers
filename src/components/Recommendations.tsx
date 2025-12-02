"use client";

import { useEffect, useState } from "react";
import { getAIRecommendations } from "@/lib/actions";
import { products, type Product } from "@/lib/data";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

export default function Recommendations({ viewedProducts }: { viewedProducts: string[] }) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const result = await getAIRecommendations(viewedProducts);
        
        // This is a simplified logic to map recommendation strings to actual products
        // In a real app, you might have a more robust lookup
        const recommendedProducts = result.recommendations
          .map(recName => 
            products.find(p => p.name.toLowerCase().includes(recName.toLowerCase().slice(0, 10)))
          )
          .filter((p): p is Product => Boolean(p))
          .slice(0, 4); // Limit to 4 recommendations

        setRecommendations(recommendedProducts);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [viewedProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Generating personalized recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20">
      <h2 className="text-3xl font-bold text-center mb-8 text-primary">Just For You</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
