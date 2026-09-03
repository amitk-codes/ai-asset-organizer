const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Asset = {
  id: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  folder_id: string | null;
  status: string;
  created_at: string;
};

export async function listAssets(): Promise<Asset[]> {
  const res = await fetch(`${BASE}/assets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load assets");
  return res.json();
}

export async function uploadAsset(file: File): Promise<Asset> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/assets`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
