export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageId: string;
};

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = {
  id: string;
  userId: string;
  orderDate: string; // ISO string
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: any;
  items: { productId: string; quantity: number; itemPrice: number }[];
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};
