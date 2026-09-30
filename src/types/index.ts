export type UserRole = 'admin' | 'customer';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  notes: string | null;
  payment_method: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
