export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageId: string;
};

export const products: Product[] = [
  {
    id: 'prod_1',
    name: 'Ornate Gold Necklace',
    slug: 'ornate-gold-necklace',
    description: 'A masterpiece of craftsmanship, this 22-karat gold necklace features intricate filigree work and a timeless design. Perfect for weddings and grand occasions.',
    price: 2500,
    category: 'Necklaces',
    imageId: 'prod-1',
  },
  {
    id: 'prod_2',
    name: 'Solitaire Diamond Ring',
    slug: 'solitaire-diamond-ring',
    description: 'An elegant 18-karat gold ring set with a brilliant-cut solitaire diamond. A classic symbol of love and commitment.',
    price: 3200,
    category: 'Rings',
    imageId: 'prod-2',
  },
  {
    id: 'prod_3',
    name: 'Gold Bangle Set',
    slug: 'gold-bangle-set',
    description: 'A set of six handcrafted 22-karat gold bangles, combining traditional motifs with a modern finish. Versatile for both casual and formal wear.',
    price: 4500,
    category: 'Bracelets',
    imageId: 'prod-3',
  },
  {
    id: 'prod_4',
    name: 'Pearl Drop Earrings',
    slug: 'pearl-drop-earrings',
    description: 'Graceful 14-karat gold earrings featuring lustrous freshwater pearls. These earrings add a touch of sophistication to any outfit.',
    price: 850,
    category: 'Earrings',
    imageId: 'prod-4',
  },
  {
    id: 'prod_5',
    name: 'Emerald Pendant',
    slug: 'emerald-pendant',
    description: 'A stunning pendant with a vibrant, lab-grown emerald set in a delicate 18-karat gold frame. Chain included.',
    price: 1800,
    category: 'Necklaces',
    imageId: 'prod-5',
  },
  {
    id: 'prod_6',
    name: "Men's Gold Chain",
    slug: 'mens-gold-chain',
    description: 'A bold and masculine 24-inch chain crafted from solid 22-karat gold. Features a sturdy lobster clasp for security.',
    price: 3800,
    category: 'Chains',
    imageId: 'prod-6',
  },
  {
    id: 'prod_7',
    name: 'Vintage Brooch',
    slug: 'vintage-brooch',
    description: 'An exquisite vintage-inspired brooch in 20-karat gold, adorned with semi-precious stones. A unique statement piece.',
    price: 1500,
    category: 'Accessories',
    imageId: 'prod-7',
  },
  {
    id: 'prod_8',
    name: 'Ruby Studs',
    slug: 'ruby-studs',
    description: 'Classic stud earrings featuring deep red, lab-grown rubies in a four-prong 18-karat gold setting. A perfect gift for any occasion.',
    price: 1100,
    category: 'Earrings',
    imageId: 'prod-8',
  },
];

export type Order = {
  id: string;
  customerName: string;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  itemCount: number;
};

export const orders: Order[] = [
  { id: 'ORD-001', customerName: 'Aisha Khan', date: '2024-07-20', status: 'Delivered', total: 3200, itemCount: 1 },
  { id: 'ORD-002', customerName: 'Bilal Ahmed', date: '2024-07-21', status: 'Shipped', total: 4500, itemCount: 1 },
  { id: 'ORD-003', customerName: 'Fatima Ali', date: '2024-07-22', status: 'Pending', total: 850, itemCount: 1 },
  { id: 'ORD-004', customerName: 'Usman Malik', date: '2024-07-22', status: 'Delivered', total: 5300, itemCount: 2 },
  { id: 'ORD-005', customerName: 'Samina Iqbal', date: '2024-07-23', status: 'Cancelled', total: 1800, itemCount: 1 },
];

export type Customer = {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  orderCount: number;
};

export const customers: Customer[] = [
  { id: 'CUST-001', name: 'Aisha Khan', email: 'aisha.k@example.com', joinDate: '2023-01-15', orderCount: 5 },
  { id: 'CUST-002', name: 'Bilal Ahmed', email: 'bilal.a@example.com', joinDate: '2023-03-22', orderCount: 3 },
  { id: 'CUST-003', name: 'Fatima Ali', email: 'fatima.a@example.com', joinDate: '2023-05-30', orderCount: 8 },
  { id: 'CUST-004', name: 'Usman Malik', email: 'usman.m@example.com', joinDate: '2023-08-11', orderCount: 2 },
  { id: 'CUST-005', name: 'Samina Iqbal', email: 'samina.i@example.com', joinDate: '2024-02-09', orderCount: 1 },
];
