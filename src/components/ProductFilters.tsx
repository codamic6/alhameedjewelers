
'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Category } from '@/lib/types';
import type { Filters } from '@/hooks/use-product-filters';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductFiltersProps = {
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  categories: Category[];
  maxPrice: number;
  className?: string;
};

export default function ProductFilters({
  filters,
  setFilters,
  categories,
  maxPrice,
  className
}: ProductFiltersProps) {

  return (
    <div className={cn("space-y-6", className)}>
        {/* Search Input */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="w-full bg-[#111111] border-border rounded-lg pl-10 focus:border-primary"
            />
        </div>
      
        <div className="space-y-2">
            <Label>Category</Label>
            <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ category: value === 'all' ? '' : value })}
            >
            <SelectTrigger className="bg-[#111111] border-border">
                <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        <div className="space-y-4">
            <Label>Price Range</Label>
            <Slider
                value={[filters.price]}
                onValueChange={(value) => setFilters({ price: value[0] })}
                max={maxPrice}
                step={1000}
                className="w-full"
            />
            <div className="text-sm text-muted-foreground text-center">
                Up to PKR {filters.price.toLocaleString()}
            </div>
        </div>
      
      <div className="space-y-3">
        <Label>Metal Type</Label>
        <RadioGroup
          value={filters.metalType}
          onValueChange={(value) => setFilters({ metalType: value === 'all' ? '' : value })}
          className="flex gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="metal-all" />
            <Label htmlFor="metal-all" className="font-normal cursor-pointer">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Gold" id="metal-gold" />
            <Label htmlFor="metal-gold" className="font-normal cursor-pointer">Gold</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Silver" id="metal-silver" />
            <Label htmlFor="metal-silver" className="font-normal cursor-pointer">Silver</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters({ sortBy: value as Filters['sortBy'] })}
        >
          <SelectTrigger className="bg-[#111111] border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
