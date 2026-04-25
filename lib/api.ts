import { admin, broker } from "./storage";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API ${status}`);
    this.status = status;
    this.body = body;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
interface CallOptions {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
}

async function call(
  path: string,
  authHeader: Record<string, string>,
  opts: CallOptions = {},
): Promise<unknown> {
  if (!BASE) {
    throw new ApiError(0, null, "NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  const url = `${BASE.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: "no-store",
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, parsed, `HTTP ${res.status}`);
  }
  return parsed;
}

/* ─── Public (no auth) ──────────────────────────────────────── */

export const apiPublic = {
  call: (path: string, opts?: CallOptions) => call(path, {}, opts),
  signup: (body: SignupBody) =>
    call("/api/tenants/signup", {}, { method: "POST", body }) as Promise<SignupResponse>,
};

/* ─── Broker (X-Tenant-Key) ─────────────────────────────────── */

export const apiBroker = {
  call: (path: string, opts?: CallOptions) => {
    const key = broker.getKey();
    if (!key) throw new ApiError(401, null, "Missing X-Tenant-Key");
    return call(path, { "X-Tenant-Key": key }, opts);
  },
  leads: (params: {
    page?: number;
    pageSize?: number;
    status?: string;
  } = {}) => {
    const qs = buildQuery(params);
    return apiBroker.call(`/api/broker/leads${qs}`) as Promise<LeadsPage>;
  },
  updateLeadStatus: (id: number, status: LeadStatus) =>
    apiBroker.call(`/api/broker/leads/${id}/status`, {
      method: "PUT",
      body: { status },
    }) as Promise<{ id: number; status: LeadStatus }>,
  settings: () => apiBroker.call("/api/broker/settings") as Promise<BrokerSettings>,
  updateSettings: (body: Partial<BrokerSettings>) =>
    apiBroker.call("/api/broker/settings", {
      method: "PUT",
      body,
    }) as Promise<BrokerSettings>,
};

/* ─── Admin (X-Admin-Key) ───────────────────────────────────── */

export const apiAdmin = {
  call: (path: string, opts?: CallOptions) => {
    const key = admin.getKey();
    if (!key) throw new ApiError(401, null, "Missing X-Admin-Key");
    return call(path, { "X-Admin-Key": key }, opts);
  },
  stats: () => apiAdmin.call("/api/admin/stats") as Promise<AdminStats>,
  health: () => apiAdmin.call("/api/admin/health/detailed") as Promise<AdminHealth>,
  tenants: (params: {
    page?: number;
    pageSize?: number;
    active?: boolean;
  } = {}) => {
    const qs = buildQuery(params);
    return apiAdmin.call(`/api/admin/tenants${qs}`) as Promise<AdminTenantsPage>;
  },
  toggleTenantActive: (id: number, active: boolean) =>
    apiAdmin.call(`/api/admin/tenants/${id}/active`, {
      method: "PUT",
      body: { active },
    }) as Promise<{ id: number; isActive: boolean; previous: boolean }>,
  failedNotifications: (hours = 24, limit = 50) =>
    apiAdmin.call(
      `/api/admin/notifications/failed?hours=${hours}&limit=${limit}`,
    ) as Promise<FailedNotificationsResult>,
};

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const search = new URLSearchParams();
  for (const [k, v] of entries) search.set(k, String(v));
  return `?${search.toString()}`;
}

/* ─── Types ─────────────────────────────────────────────────── */

export type NotificationChannel = "Email" | "WhatsApp" | "Both";
export type LeadStatus = "New" | "Notified" | "Contacted" | "Closed";

export interface SignupBody {
  businessName: string;
  brokerEmail: string;
  brokerPhone: string;
  notificationChannel: NotificationChannel;
}

export interface SignupResponse {
  tenantId: number;
  apiKey: string;
  magicCode: string;
  magicLinkInstructions: string;
  notes: string;
}

export interface BrokerSettings {
  id?: number;
  businessName: string | null;
  contactEmail: string | null;
  brokerPhone: string | null;
  notificationChannel: NotificationChannel;
  magicCode?: string | null;
  planTier?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Lead {
  id: number;
  customerPhone: string;
  customerName: string | null;
  lastMessageExcerpt: string | null;
  listingsCount: number;
  status: LeadStatus;
  notificationChannelUsed: string | null;
  notifiedAt: string | null;
  createdAt: string;
}

export interface LeadsPage {
  total: number;
  page: number;
  pageSize: number;
  items: Lead[];
}

export interface AdminStats {
  tenants: {
    total: number;
    active: number;
    inactive: number;
    newToday: number;
    newLast7Days: number;
  };
  leads: {
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
    notified: number;
    notificationSuccessRatePct: number;
    statusBreakdown: { status: string; count: number }[];
    channelMix: { channel: string; count: number }[];
  };
  topTenantsByLeads7d: { tenantId: number; leads7d: number }[];
  timestamp: string;
}

export interface AdminHealth {
  status: "healthy" | "degraded" | "unhealthy";
  env: string;
  timestamp: string;
  checks: {
    database: { ok: boolean; error: string | null };
    leadNotifications24h: {
      attempted: number;
      notified: number;
      failed: number;
      failureRatePct: number;
    };
    configPresence: Record<string, boolean | string>;
    dataSnapshot: Record<string, number>;
  };
}

export interface AdminTenant {
  id: number;
  name: string | null;
  businessName: string | null;
  contactEmail: string | null;
  brokerPhone: string | null;
  planTier: string;
  isActive: boolean;
  notificationChannel: string;
  magicCode: string | null;
  createdAt: string;
  leadsTotal: number;
  leadsLast7Days: number;
}

export interface AdminTenantsPage {
  total: number;
  page: number;
  pageSize: number;
  items: AdminTenant[];
}

export interface FailedNotificationItem {
  id: number;
  tenantId: number;
  customerPhone: string;
  customerName: string | null;
  lastMessageExcerpt: string | null;
  status: string;
  ageMinutes: number;
  createdAt: string;
}

export interface FailedNotificationsResult {
  windowHours: number;
  count: number;
  items: FailedNotificationItem[];
}
