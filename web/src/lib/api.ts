const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const KEY_STORAGE = "workspace_key";

/** Error that carries the HTTP status so callers can tell 401 from 5xx/network. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Throws ApiError on non-2xx (status 0 for network failures upstream). */
async function ensureOk(res: Response, message: string): Promise<Response> {
  if (!res.ok) throw new ApiError(res.status, message);
  return res;
}

export function getKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
}

export function setKey(key: string) {
  try {
    localStorage.setItem(KEY_STORAGE, key);
  } catch {
    // storage may be unavailable; the key just won't persist
  }
}

export function clearKey() {
  try {
    localStorage.removeItem(KEY_STORAGE);
  } catch {
    // ignore
  }
}

function authHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const key = getKey();
  if (key) headers.set("X-Api-Key", key);
  return headers;
}

// ---- auth ----

export async function signup(): Promise<string> {
  const res = await ensureOk(await fetch(`${BASE}/auth/signup`, { method: "POST" }), "Signup failed");
  return (await res.json()).key;
}

export async function login(key: string): Promise<boolean> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  return res.ok;
}

export async function rotateKey(): Promise<string> {
  const res = await ensureOk(
    await fetch(`${BASE}/auth/rotate`, { method: "POST", headers: authHeaders() }),
    "Rotate failed",
  );
  return (await res.json()).key;
}

// ---- assets ----

export type Asset = {
  id: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  folder_id: string | null;
  status: string;
  created_at: string;
  content_text?: string | null;
  url?: string | null;
};

export type AssetPage = { items: Asset[]; next_cursor: string | null };

/** Keyset-paginated list, newest first. Pass the previous page's next_cursor to continue. */
export async function listAssets(opts?: {
  limit?: number;
  cursor?: string | null;
}): Promise<AssetPage> {
  const params = new URLSearchParams();
  params.set("limit", String(opts?.limit ?? 60));
  if (opts?.cursor) params.set("cursor", opts.cursor);
  const res = await ensureOk(
    await fetch(`${BASE}/assets?${params.toString()}`, {
      cache: "no-store",
      headers: authHeaders(),
    }),
    "Failed to load assets",
  );
  return res.json();
}

export async function uploadAsset(file: File): Promise<Asset> {
  const form = new FormData();
  form.append("file", file);
  const res = await ensureOk(
    await fetch(`${BASE}/assets`, { method: "POST", body: form, headers: authHeaders() }),
    "Upload failed",
  );
  return res.json();
}

export async function moveAsset(assetId: string, folderId: string | null): Promise<Asset> {
  const res = await ensureOk(
    await fetch(`${BASE}/assets/${assetId}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ folder_id: folderId }),
    }),
    "Move failed",
  );
  return res.json();
}

export async function deleteAsset(assetId: string): Promise<void> {
  await ensureOk(
    await fetch(`${BASE}/assets/${assetId}`, { method: "DELETE", headers: authHeaders() }),
    "Delete failed",
  );
}

export async function batchDeleteAssets(ids: string[]): Promise<void> {
  await ensureOk(
    await fetch(`${BASE}/assets/batch/delete`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ids }),
    }),
    "Delete failed",
  );
}

export async function batchMoveAssets(ids: string[], folderId: string | null): Promise<void> {
  await ensureOk(
    await fetch(`${BASE}/assets/batch/move`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ids, folder_id: folderId }),
    }),
    "Move failed",
  );
}

// ---- folders ----

export type Folder = { id: string; name: string; count: number };

export async function listFolders(): Promise<Folder[]> {
  const res = await ensureOk(
    await fetch(`${BASE}/folders`, { cache: "no-store", headers: authHeaders() }),
    "Failed to load folders",
  );
  return res.json();
}

export async function deleteFolder(folderId: string): Promise<void> {
  await ensureOk(
    await fetch(`${BASE}/folders/${folderId}`, { method: "DELETE", headers: authHeaders() }),
    "Delete failed",
  );
}

// ---- organize ----

export type FolderPlan = { name: string; asset_ids: string[] };

export async function suggestFolders(): Promise<FolderPlan[]> {
  const res = await ensureOk(
    await fetch(`${BASE}/organize/suggest`, { method: "POST", headers: authHeaders() }),
    "Failed to get suggestions",
  );
  const data = await res.json();
  return data.folders ?? [];
}

export async function applyOrganization(folders: FolderPlan[]): Promise<void> {
  await ensureOk(
    await fetch(`${BASE}/organize/apply`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ folders }),
    }),
    "Failed to apply",
  );
}

// ---- search ----

export type SearchResult = {
  id: string;
  filename: string;
  mime_type: string | null;
  folder_id: string | null;
  similarity: number;
};

export async function searchAssets(query: string, limit = 10): Promise<SearchResult[]> {
  const res = await ensureOk(
    await fetch(`${BASE}/search`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ query, limit }),
    }),
    "Search failed",
  );
  const data = await res.json();
  return data.results ?? [];
}

// ---- share ----

export type Share = { id: string; target_type: string; target_id: string };
export type ShareRecord = Share & {
  created_at: string;
  expires_at: string | null;
  revoked: boolean;
};

export async function createShare(
  targetType: "folder" | "asset",
  targetId: string,
  opts?: { expiresInDays?: number },
): Promise<Share> {
  const res = await ensureOk(
    await fetch(`${BASE}/share`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        expires_in_days: opts?.expiresInDays ?? null,
      }),
    }),
    "Failed to create share",
  );
  return res.json();
}

export async function listShares(): Promise<ShareRecord[]> {
  const res = await ensureOk(
    await fetch(`${BASE}/shares`, { cache: "no-store", headers: authHeaders() }),
    "Failed to load shares",
  );
  return res.json();
}

export async function revokeShare(id: string): Promise<void> {
  await ensureOk(
    await fetch(`${BASE}/share/${id}`, { method: "DELETE", headers: authHeaders() }),
    "Failed to revoke share",
  );
}

export type SharedAsset = Asset & { url: string | null };

export type ShareResponse =
  | { type: "asset"; asset: SharedAsset }
  | { type: "folder"; folder: { id: string; name: string }; assets: SharedAsset[] };

/** Public — no auth. Usable from server components (metadata) and the client. */
export async function getShare(token: string): Promise<ShareResponse> {
  const res = await ensureOk(
    await fetch(`${BASE}/share/${token}`, { cache: "no-store" }),
    "Not found",
  );
  return res.json();
}
