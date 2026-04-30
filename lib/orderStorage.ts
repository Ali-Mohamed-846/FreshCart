import type { StoredOrder } from "@/types";
import { getUserStorageId } from "@/lib/userIdentity";

function getAuthUserIdFromStorage(): string {
  try {
    const raw = localStorage.getItem("fc_user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return getUserStorageId(user);
  } catch {
    return "";
  }
}

export function resolveUserId(explicitUserId?: string): string {
  return explicitUserId || getAuthUserIdFromStorage();
}

export function orderKey(userId?: string): string {
  return `fc_orders_user_${resolveUserId(userId)}`;
}

export function readOrders(userId?: string): StoredOrder[] {
  const uid = resolveUserId(userId);
  if (!uid) return [];
  try {
    return JSON.parse(localStorage.getItem(orderKey(uid)) ?? "[]");
  } catch {
    return [];
  }
}

export function saveOrderForUser(order: StoredOrder, userId?: string): boolean {
  const uid = resolveUserId(userId);
  if (!uid) return false;

  const key = orderKey(uid);
  const existing = readOrders(uid);
  localStorage.setItem(key, JSON.stringify([order, ...existing]));
  return true;
}
