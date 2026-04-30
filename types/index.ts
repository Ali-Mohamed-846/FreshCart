// ─── API Types ────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  sold: number;
  price: number;
  priceAfterDiscount?: number;
  colors: string[];
  imageCover: string;
  images: string[];
  category: Category;
  brand?: Brand;
  subcategory?: SubCategory[];
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface ApiResponse<T> {
  results: number;
  metadata?: { currentPage: number; numberOfPages: number; limit: number; nextPage?: number };
  data: T;
}

export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  gender?: "male" | "female";
  dateOfBirth?: string;
  token?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: AuthUser;
}

// ─── Cart Types ───────────────────────────────────────────────

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
  color?: string;
  size?: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

// ─── Wishlist Types ───────────────────────────────────────────

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
}

export interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  count: number;
}

// ─── Filter Types ─────────────────────────────────────────────

export interface ProductFilters {
  catId?: string;
  brandId?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

// ─── Order Types ──────────────────────────────────────────────

export interface StoredOrderItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  image: string;
}

export interface StoredOrder {
  id: string;
  date: string;
  items: StoredOrderItem[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered";
  shipping: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  paymentMethod: string;
}
