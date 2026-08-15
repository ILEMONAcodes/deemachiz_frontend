export interface ApiError {
  detail: string | { msg: string; [key: string]: unknown }[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  role: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
}

export interface CartResponse {
  id: number;
  user_id: number;
  items: CartItem[];
  total_price: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_title?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  shipping_address: string;
  phone: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  payment_reference?: string;
}

export interface OrderStatusUpdate {
  order_id: number;
  status: Order['status'];
  updated_at: string;
}