export type FileKind = "image" | "pdf" | "doc";

export function fileKind(mime: string | null): FileKind {
  if (mime?.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "doc";
}

export const typeMeta: Record<FileKind, { label: string; bar: string; tint: string }> = {
  image: { label: "Image", bar: "bg-blue-500", tint: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  pdf: { label: "PDF", bar: "bg-red-500", tint: "bg-red-500/15 text-red-600 dark:text-red-300" },
  doc: { label: "Doc", bar: "bg-emerald-500", tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
};
