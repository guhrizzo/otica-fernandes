"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { GalleryImage } from "@/lib/site-data";
import { revalidateHome } from "./actions";
import { ImageField, moveItem, nextSortOrder, removeImage, uploadImage } from "./shared";

const BUCKET = "gallery-images";

type AdminGalleryImage = GalleryImage & { sort_order: number };

type Draft = {
  id: string | null;
  alt: string;
  url: string | null;
  file: File | null;
  preview: string | null;
};

const emptyDraft: Draft = { id: null, alt: "", url: null, file: null, preview: null };

export default function GalleryManager() {
  const [images, setImages] = useState<AdminGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const loadImages = useCallback(async () => {
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("gallery_images")
      .select("id, url, alt, sort_order")
      .order("sort_order", { ascending: true });
    if (loadError) setError(`Não foi possível carregar a galeria: ${loadError.message}`);
    else {
      setError(null);
      setImages(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial vinda do Supabase
    loadImages();
  }, [loadImages]);

  const afterChange = async () => {
    await loadImages();
    await revalidateHome();
  };

  const openEditor = (image?: AdminGalleryImage) => {
    setFormError(null);
    setDraft(image ? { id: image.id, alt: image.alt, url: image.url, file: null, preview: null } : emptyDraft);
  };

  const closeEditor = () => {
    if (draft?.preview) URL.revokeObjectURL(draft.preview);
    setDraft(null);
    setFormError(null);
  };

  const chooseFile = (file: File) => {
    if (!draft) return;
    if (draft.preview) URL.revokeObjectURL(draft.preview);
    setDraft({ ...draft, file, preview: URL.createObjectURL(file) });
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !draft) return;
    if (!draft.file && !draft.url) {
      setFormError("Escolha uma foto.");
      return;
    }

    setSaving(true);
    setFormError(null);

    let url = draft.url;
    if (draft.file) {
      const upload = await uploadImage(BUCKET, draft.file);
      if ("error" in upload) {
        setFormError(`Falha ao enviar a foto: ${upload.error}`);
        setSaving(false);
        return;
      }
      url = upload.url;
    }

    const fields = { url: url!, alt: draft.alt.trim() };
    const { error: saveError } = draft.id
      ? await supabase.from("gallery_images").update(fields).eq("id", draft.id)
      : await supabase.from("gallery_images").insert({ ...fields, sort_order: nextSortOrder(images) });

    if (saveError) {
      if (draft.file) await removeImage(BUCKET, url);
      setFormError(`Não foi possível salvar: ${saveError.message}`);
      setSaving(false);
      return;
    }

    if (draft.file && draft.id) await removeImage(BUCKET, draft.url);

    closeEditor();
    setSaving(false);
    await afterChange();
  };

  const handleDelete = async (image: AdminGalleryImage) => {
    if (!supabase || !window.confirm("Excluir esta foto da galeria? Essa ação não pode ser desfeita.")) return;
    const { error: deleteError } = await supabase.from("gallery_images").delete().eq("id", image.id);
    if (deleteError) {
      setError(`Não foi possível excluir: ${deleteError.message}`);
      return;
    }
    await removeImage(BUCKET, image.url);
    await afterChange();
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const result = await moveItem("gallery_images", images, index, direction);
    setImages(result.items);
    if (result.error) setError(`Não foi possível reordenar: ${result.error}`);
    await afterChange();
  };

  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1>Galeria</h1>
          <p className="admin-muted">Fotos da galeria “Nossa loja”, exibidas em mosaico nesta ordem. No site, tocar numa foto abre ela em tela cheia com zoom.</p>
        </div>
        <button className="button button-red" onClick={() => openEditor()}>
          <Plus size={17} /> Nova foto
        </button>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-muted">Carregando galeria…</p>
      ) : images.length === 0 ? (
        !error && (
          <div className="admin-card admin-empty">
            <p>Nenhuma foto cadastrada ainda. Enquanto isso, o site mostra as fotos padrão da loja.</p>
          </div>
        )
      ) : (
        <ul className="admin-list">
          {images.map((image, index) => (
            <li className="admin-card admin-item admin-item-gallery" key={image.id}>
              <div className="admin-thumb admin-thumb-wide">
                <Image src={image.url} alt="" fill sizes="128px" />
              </div>
              <div className="admin-item-info">
                <strong>{image.alt || "Sem descrição"}</strong>
                <span>Foto {index + 1}</span>
              </div>
              <div className="admin-actions">
                <button className="admin-icon-button" onClick={() => handleMove(index, -1)} disabled={index === 0} aria-label="Mover para cima" title="Mover para cima"><ArrowUp size={17} /></button>
                <button className="admin-icon-button" onClick={() => handleMove(index, 1)} disabled={index === images.length - 1} aria-label="Mover para baixo" title="Mover para baixo"><ArrowDown size={17} /></button>
                <button className="admin-icon-button" onClick={() => openEditor(image)} aria-label="Editar" title="Editar"><Pencil size={17} /></button>
                <button className="admin-icon-button admin-danger" onClick={() => handleDelete(image)} aria-label="Excluir" title="Excluir"><Trash2 size={17} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft && (
        <div className="admin-overlay" role="dialog" aria-modal="true" aria-labelledby="gallery-form-title" onClick={() => !saving && closeEditor()}>
          <form className="admin-card admin-form" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
            <div className="admin-form-head">
              <h2 id="gallery-form-title">{draft.id ? "Editar foto" : "Nova foto"}</h2>
              <button type="button" className="admin-icon-button" onClick={closeEditor} disabled={saving} aria-label="Fechar"><X size={18} /></button>
            </div>

            <ImageField imageUrl={draft.url} preview={draft.preview} onChoose={chooseFile} />

            <label>
              Descrição da foto
              <input value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} placeholder="Fachada da Ótica Fernandes" />
            </label>
            <p className="admin-muted admin-hint">Usada por leitores de tela e pelo Google. Descreva o que aparece na foto.</p>

            {formError && <p className="admin-error" role="alert">{formError}</p>}

            <div className="admin-form-actions">
              <button type="button" className="admin-text-button" onClick={closeEditor} disabled={saving}>Cancelar</button>
              <button type="submit" className="button button-red" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
