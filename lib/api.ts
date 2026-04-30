import type { ApiResponse, Product, Category, Brand, AuthResponse, SubCategory } from "@/types";
import { getUserStorageId } from "@/lib/userIdentity";

const API_BASE = "https://ecommerce.routemisr.com/api/v1";
const API_ROOT = "https://ecommerce.routemisr.com";


async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };
  const res = await fetch(`${API_BASE}${path}`, {
    headers: mergedHeaders,
    ...init,
  });

  if (!res.ok) {
    let body: any = {};
    try { body = await res.json(); } catch { }
    const err: any = new Error(body?.message ?? `API error ${res.status}`);
    err.response = { data: body, status: res.status };
    throw err;
  }

  return res.json() as T;
}

async function apiFetchV2<T>(path: string, init?: RequestInit): Promise<T> {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };
  const res = await fetch(`${API_ROOT}/api/v2${path}`, {
    headers: mergedHeaders,
    ...init,
  });

  if (!res.ok) {
    let body: any = {};
    try { body = await res.json(); } catch { }
    const err: any = new Error(body?.message ?? `API error ${res.status}`);
    err.response = { data: body, status: res.status };
    throw err;
  }

  return res.json() as T;
}


export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as any;
  const data = e?.response?.data;

  let raw: string | undefined;
  if (data && typeof data === "object") {
    const m = (data as { message?: unknown }).message;
    const er = (data as { error?: unknown }).error;
    if (typeof m === "string" && m.trim()) raw = m.trim();
    else if (typeof er === "string" && er.trim()) raw = er.trim();
    else if (Array.isArray((data as { errors?: unknown }).errors)) {
      const first = (data as { errors: { message?: string; msg?: string }[] }).errors[0];
      const piece = first?.message ?? first?.msg;
      if (typeof piece === "string" && piece.trim()) raw = piece.trim();
    }
  }

  const text = String(raw ?? e?.message ?? "").trim();
  const low = text.toLowerCase();
  if (!text || low === "fail" || low === "error" || low === "false" || low === "bad request") {
    return fallback;
  }
  return text;
}

// ── Products ──────────────────────────────────────────────────

interface ProductParams {
  limit?: number;
  page?: number;
  category?: string;
  categoryIn?: string[];
  brand?: string;
  keyword?: string;
  sort?: string;
  fields?: string;
  "price[gte]"?: number;
  "price[lte]"?: number;
  "ratingsAverage[gte]"?: number;
}

export async function getProducts(params: ProductParams = {}): Promise<ApiResponse<Product[]>> {
  const qsBuilder = new URLSearchParams();
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  for (const [k, v] of entries) {
    if (k === "categoryIn" && Array.isArray(v)) {
      for (const id of v) qsBuilder.append("category[in]", String(id));
      continue;
    }
    qsBuilder.append(k, String(v));
  }
  const qs = qsBuilder.toString();

  return apiFetch<ApiResponse<Product[]>>(`/products${qs ? `?${qs}` : ""}`);
}

export async function getProduct(id: string): Promise<Product> {
  const data = await apiFetch<ApiResponse<Product>>(`/products/${id}`);
  return data.data;
}

// ── Categories ────────────────────────────────────────────────

export async function getCategories(params?: { limit?: number; page?: number; keyword?: string }): Promise<Category[]> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.append("limit", String(params.limit));
  if (params?.page) qs.append("page", String(params.page));
  if (params?.keyword) qs.append("keyword", params.keyword);
  const data = await apiFetch<ApiResponse<Category[]>>(`/categories${qs.toString() ? `?${qs}` : ""}`);
  return data.data;
}

export async function getCategory(id: string): Promise<Category> {
  const data = await apiFetch<ApiResponse<Category>>(`/categories/${id}`);
  return data.data;
}

export async function getSubCategories(params?: { limit?: number }): Promise<ApiResponse<SubCategory[]>> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.append("limit", String(params.limit));
  return apiFetch<ApiResponse<SubCategory[]>>(`/subcategories${qs.toString() ? `?${qs}` : ""}`);
}

export async function getSubCategory(id: string): Promise<SubCategory> {
  const data = await apiFetch<ApiResponse<SubCategory>>(`/subcategories/${id}`);
  return data.data;
}

export async function getSubCategoriesOnCategory(categoryId: string): Promise<ApiResponse<SubCategory[]>> {
  return apiFetch<ApiResponse<SubCategory[]>>(`/categories/${categoryId}/subcategories`);
}

// ── Brands ────────────────────────────────────────────────────

export async function getBrands(params?: { limit?: number; keyword?: string }): Promise<Brand[]> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.append("limit", String(params.limit));
  if (params?.keyword) qs.append("keyword", params.keyword);
  const data = await apiFetch<ApiResponse<Brand[]>>(`/brands${qs.toString() ? `?${qs}` : ""}`);
  return data.data;
}

export async function getBrand(id: string): Promise<Brand> {
  const data = await apiFetch<ApiResponse<Brand>>(`/brands/${id}`);
  return data.data;
}

// ── Auth ──────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res.user) {
    const normalizedId = getUserStorageId(res.user);
    res.user = { ...res.user, _id: normalizedId };
  }
  return res;
}

export async function signUp(payload: {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  phone: string;
}): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res.user) {
    const normalizedId = getUserStorageId(res.user);
    res.user = { ...res.user, _id: normalizedId };
  }
  return res;
}

// ── User ───────────────────────────────────────────────────────
export async function forgotPassword(email: string) {
  return apiFetch<any>("/auth/forgotPasswords", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyResetCode(resetCode: string) {
  const res = await apiFetch<any>("/auth/verifyResetCode", {
    method: "POST",
    body: JSON.stringify({ resetCode }),
  });
  const status = String(res?.status ?? res?.message ?? "").toLowerCase();
  if (!status.includes("success") && !status.includes("verified")) {
    const err: any = new Error(res?.message ?? "Invalid verification code.");
    err.response = { data: res };
    throw err;
  }
  return res;
}

export async function resetPassword(opts: { email: string; newPassword: string }) {
  return apiFetch<any>("/auth/resetPassword", {
    method: "PUT",
    body: JSON.stringify({
      email: opts.email,
      newPassword: opts.newPassword,
    }),
  });
}

export async function changePassword(opts: {
  token: string;
  currentPassword: string;
  newPassword: string;
}) {
  const headers = {
    "Content-Type": "application/json",
    token: opts.token,
  };

  return apiFetch<any>("/users/changeMyPassword", {
    method: "PUT",
    headers,
    body: JSON.stringify({
      currentPassword: opts.currentPassword,
      password: opts.newPassword,
      rePassword: opts.newPassword,
    }),
  });
}

export async function verifyToken(token: string) {
  return apiFetch<any>("/auth/verifyToken", {
    method: "GET",
    headers: { token },
  });
}

export async function updateLoggedUserData(opts: {
  token: string;
  name?: string;
  email?: string;
  phone?: string;
}) {
  return apiFetch<any>("/users/updateMe/", {
    method: "PUT",
    headers: { token: "" },
    body: JSON.stringify({
      ...(opts.name ? { name: opts.name } : {}),
      ...(opts.email ? { email: opts.email } : {}),
      ...(opts.phone ? { phone: opts.phone } : {}),
    }),
  });
}

export async function getAllUsers(params?: { limit?: number; keyword?: string }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.append("limit", String(params.limit));
  if (params?.keyword) qs.append("keyword", params.keyword);
  return apiFetch<any>(`/users${qs.toString() ? `?${qs}` : ""}`);
}

// ── Wishlist ───────────────────────────────────────────────────
export async function addToWishlist(token: string, productId: string) {
  return apiFetch<any>("/wishlist", {
    method: "POST",
    headers: { token },
    body: JSON.stringify({ productId }),
  });
}

export async function removeFromWishlist(token: string, productId: string) {
  return apiFetch<any>(`/wishlist/${productId}`, {
    method: "DELETE",
    headers: { token },
  });
}

export async function getLoggedUserWishlist(token: string) {
  return apiFetch<any>("/wishlist", {
    method: "GET",
    headers: { token },
  });
}

// ── Addresses ──────────────────────────────────────────────────
export async function addAddress(
  token: string,
  payload: { name: string; details: string; phone: string; city: string }
) {
  return apiFetch<any>("/addresses", {
    method: "POST",
    headers: { token },
    body: JSON.stringify(payload),
  });
}

export async function removeAddress(token: string, addressId: string) {
  return apiFetch<any>(`/addresses/${addressId}`, {
    method: "DELETE",
    headers: { token },
  });
}

export async function getAddressById(token: string, addressId: string) {
  return apiFetch<any>(`/addresses/${addressId}`, {
    method: "GET",
    headers: { token },
  });
}

export async function getLoggedUserAddresses(token: string) {
  return apiFetch<any>("/addresses", {
    method: "GET",
    headers: { token },
  });
}

// ── Cart v1 ────────────────────────────────────────────────────
export async function addProductToCart(token: string, productId: string) {
  return apiFetch<any>("/cart", {
    method: "POST",
    headers: { token },
    body: JSON.stringify({ productId }),
  });
}

export async function updateCartProductQuantity(token: string, productId: string, count: number) {
  return apiFetch<any>(`/cart/${productId}`, {
    method: "PUT",
    headers: { token },
    body: JSON.stringify({ count }),
  });
}

export async function getLoggedUserCart(token: string) {
  return apiFetch<any>("/cart", {
    method: "GET",
    headers: { token },
  });
}

export async function removeCartItem(token: string, productId: string) {
  return apiFetch<any>(`/cart/${productId}`, {
    method: "DELETE",
    headers: { token },
  });
}

export async function clearUserCart(token: string) {
  return apiFetch<any>("/cart", {
    method: "DELETE",
    headers: { token },
  });
}

// ── Cart v2 ────────────────────────────────────────────────────
export async function addProductToCartV2(token: string, productId: string) {
  return apiFetchV2<any>("/cart", {
    method: "POST",
    headers: { token, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId }),
  });
}

export async function getLoggedUserCartV2(token: string) {
  return apiFetchV2<any>("/cart", {
    method: "GET",
    headers: { token },
  });
}

export async function updateCartProductQuantityV2(token: string, productId: string, count: number) {
  return apiFetchV2<any>(`/cart/${productId}`, {
    method: "PUT",
    headers: { token },
    body: JSON.stringify({ count }),
  });
}

export async function removeProductFromCartV2(token: string, productId: string) {
  return apiFetchV2<any>(`/cart/${productId}`, {
    method: "DELETE",
    headers: { token },
  });
}

export async function clearUserCartV2(token: string) {
  return apiFetchV2<any>("/cart", {
    method: "DELETE",
    headers: { token },
  });
}

export async function applyCouponToCartV2(token: string, couponName: string) {
  return apiFetchV2<any>("/cart/applyCoupon", {
    method: "PUT",
    headers: { token },
    body: JSON.stringify({ couponName }),
  });
}

// ── Reviews ────────────────────────────────────────────────────
export async function createReviewForProduct(
  token: string,
  productId: string,
  payload: { review: string; rating: number }
) {
  return apiFetch<any>(`/products/${productId}/reviews`, {
    method: "POST",
    headers: { token },
    body: JSON.stringify(payload),
  });
}

export async function getReviewsForProduct(productId: string) {
  return apiFetch<any>(`/products/${productId}/reviews`);
}

export async function getAllReviews() {
  return apiFetch<any>("/reviews");
}

export async function getReviewById(reviewId: string) {
  return apiFetch<any>(`/reviews/${reviewId}`);
}

export async function updateReview(
  token: string,
  reviewId: string,
  payload: { review: string; rating: number }
) {
  return apiFetch<any>(`/reviews/${reviewId}`, {
    method: "PUT",
    headers: { token },
    body: JSON.stringify(payload),
  });
}

export async function deleteReview(token: string, reviewId: string) {
  return apiFetch<any>(`/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { token },
  });
}

// ── Orders ─────────────────────────────────────────────────────
export async function createCashOrder(
  token: string,
  cartId: string,
  shippingAddress: { details: string; phone: string; city: string }
) {
  return apiFetch<any>(`/orders/${cartId}`, {
    method: "POST",
    headers: { token },
    body: JSON.stringify({ shippingAddress }),
  });
}

export async function createCashOrderV2(
  token: string,
  cartId: string,
  shippingAddress: { details: string; phone: string; city: string; postalCode?: string }
) {
  return apiFetchV2<any>(`/orders/${cartId}`, {
    method: "POST",
    headers: { token },
    body: JSON.stringify({ shippingAddress }),
  });
}

export async function checkoutSession(
  token: string,
  cartId: string,
  url: string,
  shippingAddress: { details: string; phone: string; city: string }
) {
  const qs = new URLSearchParams({ url }).toString();
  return apiFetch<any>(`/orders/checkout-session/${cartId}?${qs}`, {
    method: "POST",
    headers: { token },
    body: JSON.stringify({ shippingAddress }),
  });
}

export async function getUserOrders(userId: string) {
  return apiFetch<any>(`/orders/user/${userId}`);
}
