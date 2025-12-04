import { Timestamp } from 'firebase/firestore';

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
  orderDate: Timestamp | string; // Can be a timestamp or an ISO string initially
  subTotal: number;
  couponCode: string | null;
  couponDiscount: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: any;
  paymentMethod: string;
  items: { productId: string; productName: string; quantity: number; itemPrice: number }[];
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type Coupon = {
  id:string;
  code: string;
  discountPercentage: number;
  startDate: Timestamp;
  endDate: Timestamp;
  applicableProductIds: string[];
  usageLimit: number;
  timesUsed: number;
  minimumOrderValue?: number;
  minimumItemCount?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};
