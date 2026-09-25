"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Extrai o caminho do arquivo dentro do bucket a partir da URL pública,
// para podermos apagar a foto antiga. Retorna null para imagens de fora do bucket.
export const storagePathOf = (bucket: string, url: string | null) => {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url?.indexOf(marker) ?? -1;
  return url && index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null;
};

export async function uploadImage(bucket: string, file: File) {
  if (!supabase) return { error: "Supabase não configurado." } as const;
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) return { error: error.message } as const;
  return { path, url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl } as const;
}

export async function removeImage(bucket: string, url: string | null) {
  const path = storagePathOf(bucket, url);
  if (supabase && path) await supabase.storage.from(bucket).remove([path]);
}

// Troca o item de posição com o vizinho e renumera a lista inteira para evitar
// empates de sort_order. Retorna a lista reordenada e a mensagem de erro, se houver.
export async function moveItem<T extends { id: string; sort_order: number }>(
  table: string,
  items: T[],
  index: number,
  direction: -1 | 1
) {
  const current = items[index];
  const neighbor = items[index + direction];
  if (!supabase || !current || !neighbor) return { items, error: null };

  const swapped = [...items];
  swapped[index] = neighbor;
  swapped[index + direction] = current;

  const results = await Promise.all(
    swapped.map((item, position) =>
      item.sort_order === position ? null : supabase!.from(table).update({ sort_order: position }).eq("id", item.id)
    )
  );
  const error = results.find((result) => result?.error)?.error?.message ?? null;
  return { items: swapped.map((item, position) => ({ ...item, sort_order: position })), error };
}

export const nextSortOrder = (items: { sort_order: number }[]) =>
  items.reduce((max, item) => Math.max(max, item.sort_order), -1) + 1;

type ImageFieldProps = {
  imageUrl: string | null;
  preview: string | null;
  onChoose: (file: File) => void;
  required?: boolean;
};

export function ImageField({ imageUrl, preview, onChoose, required }: ImageFieldProps) {
  const shown = preview ?? imageUrl;
  return (
    <>
      <label className="admin-dropzone">
        {shown ? (
          <Image src={shown} alt="" fill sizes="420px" unoptimized={Boolean(preview)} />
        ) : (
          <span><ImagePlus size={26} /> Escolher foto</span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={required && !shown}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChoose(file);
          }}
        />
      </label>
      {shown && <p className="admin-muted admin-hint">Clique na foto para trocar.</p>}
    </>
  );
}
