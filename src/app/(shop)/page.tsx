"use client";

import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Recommendations from "@/components/Recommendations";
import { products } from "@/lib/data";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [viewedProducts, setViewedProducts] = useState<string[]>([]);

  useEffect(() => {
    // This is a simple mock of tracking browsing history.
    // In a real app, this would be updated as the user navigates.
    const mockHistory = JSON.parse(sessionStorage.getItem('viewedProducts') || '[]');
    setViewedProducts(mockHistory);
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
        <section id="featured-products" className="mb-12 md:mb-20">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            Featured Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>

        <Recommendations viewedProducts={viewedProducts} />
      </div>
    </motion.div>
  );
}
