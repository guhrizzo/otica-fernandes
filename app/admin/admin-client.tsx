"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowDown, ArrowUp, ImagePlus, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/site-data";
import { revalidateHome } from "./actions";

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

// Extrai o caminho do arquivo dentro do bucket a partir da URL pública,
// para podermos apagar a foto antiga. Retorna null para imagens de fora do bucket.
const storagePathOf = (url: string | null) => {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url?.indexOf(marker) ?? -1;
  return url && index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null;
};

export default function AdminClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <main className="admin-shell admin-centered">
        <div className="admin-card admin-notice">
          <h1>Supabase não configurado</h1>
          <p>
            Crie o arquivo <code>.env.local</code> a partir do <code>.env.example</code> com a URL e a chave anônima do
            projeto Supabase e reinicie o servidor.
          </p>
        </div>
      </main>
    );
  }

  if (checkingSession) return <main className="admin-shell admin-centered"><p className="admin-muted">Carregando…</p></main>;

  return session ? <ProductsManager email={session.user.email ?? ""} /> : <LoginForm />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError("E-mail ou senha incorretos.");
    setLoading(false);
  };

  return (
    <main className="admin-shell admin-centered">
      <form className="admin-card admin-login" onSubmit={handleSubmit}>
        <Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} priority className="admin-logo" />
        <h1>Painel administrativo</h1>
        <label>
          E-mail
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="button button-red" type="submit" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}

function ProductsManager({ email }: { email: string }) {
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
  const chooseFile = (file: File | null) => {
    if (!draft || !file) return;
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
    let uploadedPath: string | null = null;
    if (draft.file) {
      const extension = draft.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, draft.file, {
        cacheControl: "31536000",
        contentType: draft.file.type,
      });
      if (uploadError) {
        setFormError(`Falha ao enviar a foto: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      uploadedPath = path;
      imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const fields = { name: draft.name.trim(), type: draft.type.trim(), price, image_url: imageUrl };
    const nextSortOrder = products.reduce((max, product) => Math.max(max, product.sort_order), -1) + 1;
    const { error: saveError } = draft.id
      ? await supabase.from("products").update(fields).eq("id", draft.id)
      : await supabase.from("products").insert({ ...fields, sort_order: nextSortOrder });

    if (saveError) {
      if (uploadedPath) await supabase.storage.from(BUCKET).remove([uploadedPath]);
      setFormError(`Não foi possível salvar: ${saveError.message}`);
      setSaving(false);
      return;
    }

    // Foto substituída: remove a antiga do storage.
    const previous = draft.id ? products.find((product) => product.id === draft.id)?.image_url ?? null : null;
    const oldPath = draft.file ? storagePathOf(previous) : null;
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);

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
    const path = storagePathOf(product.image_url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    await afterChange();
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    if (!supabase) return;
    const current = products[index];
    const neighbor = products[index + direction];
    if (!current || !neighbor) return;

    // Renumera a lista inteira para evitar empates de sort_order.
    const reordered = [...products];
    reordered[index] = neighbor;
    reordered[index + direction] = current;
    setProducts(reordered.map((product, position) => ({ ...product, sort_order: position })));

    const results = await Promise.all(
      reordered.map((product, position) =>
        product.sort_order === position
          ? null
          : supabase!.from("products").update({ sort_order: position }).eq("id", product.id)
      )
    );
    const moveError = results.find((result) => result?.error)?.error;
    if (moveError) setError(`Não foi possível reordenar: ${moveError.message}`);
    await afterChange();
  };

  const draftImage = draft?.preview ?? draft?.image_url ?? null;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="admin-brand" aria-label="Ver o site">
          <Image src="/logo.png" alt="Ótica Fernandes" width={798} height={589} priority />
        </Link>
        <div className="admin-user">
          <span>{email}</span>
          <button className="admin-icon-button" onClick={() => supabase?.auth.signOut()} aria-label="Sair" title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-title-row">
          <div>
            <p className="eyebrow"><span /> Painel</p>
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
                  {product.image_url ? (
                    <Image src={product.image_url} alt="" fill sizes="80px" />
                  ) : (
                    <ImagePlus size={22} />
                  )}
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
      </section>

      {draft && (
        <div className="admin-overlay" role="dialog" aria-modal="true" aria-labelledby="product-form-title" onClick={() => !saving && closeEditor()}>
          <form className="admin-card admin-form" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
            <div className="admin-form-head">
              <h2 id="product-form-title">{draft.id ? "Editar produto" : "Novo produto"}</h2>
              <button type="button" className="admin-icon-button" onClick={closeEditor} disabled={saving} aria-label="Fechar"><X size={18} /></button>
            </div>

            <label className="admin-dropzone">
              {draftImage ? (
                <Image src={draftImage} alt="" fill sizes="420px" unoptimized={Boolean(draft.preview)} />
              ) : (
                <span><ImagePlus size={26} /> Escolher foto</span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {draftImage && <p className="admin-muted admin-hint">Clique na foto para trocar.</p>}

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
    </main>
  );
}
