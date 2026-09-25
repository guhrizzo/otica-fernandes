"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/site-data";
import { revalidateHome } from "./actions";
import { ImageField, moveItem, nextSortOrder, removeImage, uploadImage } from "./shared";

const BUCKET = "product-images";

const typeSuggestions = [
  "Óculos de grau",
  "Óculos de sol",
  "Relógio feminino",
  "Relógio masculino",
  "Joia",
  "Semijoia",
];

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type AdminProduct = Product & { sort_order: number };

type Draft = {
  id: string | null;
  name: string;
  type: string;
  price: string;
  image_url: string | null;
  file: File | null;
  preview: string | null;
};

const emptyDraft: Draft = { id: null, name: "", type: "", price: "", image_url: null, file: null, preview: null };

// Aceita "1.234,56", "1234,56" e "1234.56".
const parsePrice = (value: string) => {
  const normalized = value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value;
  const price = Number(normalized.trim());
  return Number.isFinite(price) && price >= 0 ? Math.round(price * 100) / 100 : null;
};

export default function ProductsManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("products")
      .select("id, name, type, price, image_url, sort_order")
      .order("sort_order", { ascending: true });
    if (loadError) setError(`Não foi possível carregar os produtos: ${loadError.message}`);
    else {
      setError(null);
      setProducts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial vinda do Supabase
    loadProducts();
  }, [loadProducts]);

  const afterChange = async () => {
    await loadProducts();
    await revalidateHome();
  };

  const openEditor = (product?: AdminProduct) => {
    setFormError(null);
    setDraft(
      product
        ? { id: product.id, name: product.name, type: product.type, price: product.price.toFixed(2).replace(".", ","), image_url: product.image_url, file: null, preview: null }
        : emptyDraft
    );
  };

  const closeEditor = () => {
    if (draft?.preview) URL.revokeObjectURL(draft.preview);
    setDraft(null);
    setFormError(null);
  };

  // Pré-visualização local da foto escolhida antes do upload.
  const chooseFile = (file: File) => {
    if (!draft) return;
    if (draft.preview) URL.revokeObjectURL(draft.preview);
    setDraft({ ...draft, file, preview: URL.createObjectURL(file) });
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !draft) return;

    const price = parsePrice(draft.price);
    if (price === null) {
      setFormError("Preço inválido. Use, por exemplo, 289,90.");
      return;
    }

    setSaving(true);
    setFormError(null);

    let imageUrl = draft.image_url;
    if (draft.file) {
      const upload = await uploadImage(BUCKET, draft.file);
      if ("error" in upload) {
        setFormError(`Falha ao enviar a foto: ${upload.error}`);
        setSaving(false);
        return;
      }
      imageUrl = upload.url;
    }

    const fields = { name: draft.name.trim(), type: draft.type.trim(), price, image_url: imageUrl };
    const { error: saveError } = draft.id
      ? await supabase.from("products").update(fields).eq("id", draft.id)
      : await supabase.from("products").insert({ ...fields, sort_order: nextSortOrder(products) });

    if (saveError) {
      if (draft.file) await removeImage(BUCKET, imageUrl);
      setFormError(`Não foi possível salvar: ${saveError.message}`);
      setSaving(false);
      return;
    }

    // Foto substituída: remove a antiga do storage.
    if (draft.file && draft.id) await removeImage(BUCKET, draft.image_url);

    closeEditor();
    setSaving(false);
    await afterChange();
  };

  const handleDelete = async (product: AdminProduct) => {
    if (!supabase || !window.confirm(`Excluir "${product.name}"? Essa ação não pode ser desfeita.`)) return;
    const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id);
    if (deleteError) {
      setError(`Não foi possível excluir: ${deleteError.message}`);
      return;
    }
    await removeImage(BUCKET, product.image_url);
    await afterChange();
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const result = await moveItem("products", products, index, direction);
    setProducts(result.items);
    if (result.error) setError(`Não foi possível reordenar: ${result.error}`);
    await afterChange();
  };

  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1>Produtos</h1>
          <p className="admin-muted">Os produtos aparecem na seção “Seleção Fernandes” do site, nesta ordem.</p>
        </div>
        <button className="button button-red" onClick={() => openEditor()}>
          <Plus size={17} /> Novo produto
        </button>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-muted">Carregando produtos…</p>
      ) : products.length === 0 ? (
        !error && (
          <div className="admin-card admin-empty">
            <p>Nenhum produto cadastrado ainda. Enquanto isso, o site mostra produtos de exemplo.</p>
          </div>
        )
      ) : (
        <ul className="admin-list">
          {products.map((product, index) => (
            <li className="admin-card admin-item" key={product.id}>
              <div className="admin-thumb">
                {product.image_url ? <Image src={product.image_url} alt="" fill sizes="80px" /> : <ImagePlus size={22} />}
              </div>
              <div className="admin-item-info">
                <strong>{product.name}</strong>
                <span>{product.type}</span>
              </div>
              <span className="admin-price">{priceFormatter.format(product.price)}</span>
              <div className="admin-actions">
                <button className="admin-icon-button" onClick={() => handleMove(index, -1)} disabled={index === 0} aria-label="Mover para cima" title="Mover para cima"><ArrowUp size={17} /></button>
                <button className="admin-icon-button" onClick={() => handleMove(index, 1)} disabled={index === products.length - 1} aria-label="Mover para baixo" title="Mover para baixo"><ArrowDown size={17} /></button>
                <button className="admin-icon-button" onClick={() => openEditor(product)} aria-label="Editar" title="Editar"><Pencil size={17} /></button>
                <button className="admin-icon-button admin-danger" onClick={() => handleDelete(product)} aria-label="Excluir" title="Excluir"><Trash2 size={17} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft && (
        <div className="admin-overlay" role="dialog" aria-modal="true" aria-labelledby="product-form-title" onClick={() => !saving && closeEditor()}>
          <form className="admin-card admin-form" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
            <div className="admin-form-head">
              <h2 id="product-form-title">{draft.id ? "Editar produto" : "Novo produto"}</h2>
              <button type="button" className="admin-icon-button" onClick={closeEditor} disabled={saving} aria-label="Fechar"><X size={18} /></button>
            </div>

            <ImageField imageUrl={draft.image_url} preview={draft.preview} onChoose={chooseFile} />

            <label>
              Nome
              <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Solar Acetato" />
            </label>
            <label>
              Categoria
              <input required list="product-types" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} placeholder="Óculos de sol" />
              <datalist id="product-types">
                {typeSuggestions.map((type) => <option key={type} value={type} />)}
              </datalist>
            </label>
            <label>
              Preço (R$)
              <input required inputMode="decimal" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="289,90" />
            </label>

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
