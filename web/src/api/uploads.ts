import { api } from "@/lib/api";

type Kind = "paylink-image" | "digital-asset";

export async function presign(
  kind: Kind,
  filename: string,
  contentType: string
) {
  const { data } = await api.post<{
    uploadUrl: string;
    key: string;
    publicUrl?: string;
    downloadUrl?: string;
    contentType: string;
  }>("/v1/uploads/presign", { kind, filename, contentType });
  return data;
}

export async function uploadFileDirect(kind: Kind, file: File) {
  const { uploadUrl, key, publicUrl, downloadUrl, contentType } = await presign(
    kind,
    file.name,
    file.type || "application/octet-stream"
  );

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return { key, publicUrl, downloadUrl };
}

export async function getDownloadUrl(key: string, expiresIn = 300) {
  const { data } = await api.post<{ downloadUrl: string }>(
    "/v1/uploads/download-url",
    { key, expiresIn }
  );
  return data.downloadUrl;
}
