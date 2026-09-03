const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const KEY_STORAGE = "workspace_key";

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
  const res = await fetch(`${BASE}/auth/signup`, { method: "POST" });
  if (!res.ok) throw new Error("Signup failed");
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
  const res = await fetch(`${BASE}/auth/rotate`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error("Rotate failed");
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

export async function listAssets(): Promise<Asset[]> {
  const res = await fetch(`${BASE}/assets`, { cache: "no-store", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load assets");
  return res.json();
}

export async function uploadAsset(file: File): Promise<Asset> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/assets`, {
    method: "POST",
    body: form,
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function moveAsset(assetId: string, folderId: string | null): Promise<Asset> {
  const res = await fetch(`${BASE}/assets/${assetId}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ folder_id: folderId }),
  });
  if (!res.ok) throw new Error("Move failed");
  return res.json();
}

export async function deleteAsset(assetId: string): Promise<void> {
  const res = await fetch(`${BASE}/assets/${assetId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
}

// ---- folders ----

export type Folder = { id: string; name: string; count: number };

export async function listFolders(): Promise<Folder[]> {
  const res = await fetch(`${BASE}/folders`, { cache: "no-store", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load folders");
  return res.json();
}

export async function deleteFolder(folderId: string): Promise<void> {
  const res = await fetch(`${BASE}/folders/${folderId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
}

// ---- organize ----

export type FolderPlan = { name: string; asset_ids: string[] };

export async function suggestFolders(): Promise<FolderPlan[]> {
  const res = await fetch(`${BASE}/organize/suggest`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to get suggestions");
  const data = await res.json();
  return data.folders ?? [];
}

export async function applyOrganization(folders: FolderPlan[]): Promise<void> {
  const res = await fetch(`${BASE}/organize/apply`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ folders }),
  });
  if (!res.ok) throw new Error("Failed to apply");
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
  const res = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results ?? [];
}

// ---- share ----

export type Share = { id: string; target_type: string; target_id: string };

export async function createShare(
  targetType: "folder" | "asset",
  targetId: string,
): Promise<Share> {
  const res = await fetch(`${BASE}/share`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ target_type: targetType, target_id: targetId }),
  });
  if (!res.ok) throw new Error("Failed to create share");
  return res.json();
}

export type SharedAsset = Asset & { url: string | null };

export type ShareResponse =
  | { type: "asset"; asset: SharedAsset }
  | { type: "folder"; folder: { id: string; name: string }; assets: SharedAsset[] };

export async function getShare(token: string): Promise<ShareResponse> {
  const res = await fetch(`${BASE}/share/${token}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}
