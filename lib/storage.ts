/**
 * localStorage wrappers — single source of truth for credential keys
 * the frontend persists. Wrapped in helpers so we never typo a key
 * or sprinkle string literals across components.
 */

const TENANT_KEY = "pa.tenantKey";
const TENANT_NAME = "pa.tenantName";
const TENANT_ID = "pa.tenantId";
const ADMIN_KEY = "pa.adminKey";

function isBrowser() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export const broker = {
  getKey(): string | null {
    return isBrowser() ? localStorage.getItem(TENANT_KEY) : null;
  },
  setKey(key: string) {
    if (isBrowser()) localStorage.setItem(TENANT_KEY, key);
  },
  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(TENANT_KEY);
    localStorage.removeItem(TENANT_NAME);
    localStorage.removeItem(TENANT_ID);
  },
  setProfile(id: number, name: string) {
    if (!isBrowser()) return;
    localStorage.setItem(TENANT_ID, String(id));
    localStorage.setItem(TENANT_NAME, name);
  },
  getProfile() {
    if (!isBrowser()) return { id: null, name: null };
    return {
      id: localStorage.getItem(TENANT_ID),
      name: localStorage.getItem(TENANT_NAME),
    };
  },
};

export const admin = {
  getKey(): string | null {
    return isBrowser() ? localStorage.getItem(ADMIN_KEY) : null;
  },
  setKey(key: string) {
    if (isBrowser()) localStorage.setItem(ADMIN_KEY, key);
  },
  clear() {
    if (isBrowser()) localStorage.removeItem(ADMIN_KEY);
  },
};
