"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GalleryManager from "./gallery-manager";
import ProductsManager from "./products-manager";
import SettingsForm from "./settings-form";

const tabs = [
  { id: "produtos", label: "Produtos" },
  { id: "galeria", label: "Galeria" },
  { id: "textos", label: "Textos" },
] as const;

type TabId = (typeof tabs)[number]["id"];

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

  return session ? <AdminPanel email={session.user.email ?? ""} /> : <LoginForm />;
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
          <input type="email" autoComplete="email" required placeholder="voce@oticafernandes.com.br" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="current-password" required placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="button button-red" type="submit" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}

function AdminPanel({ email }: { email: string }) {
  // A aba fica no hash da URL (/admin#galeria) para sobreviver a um recarregamento.
  const [tab, setTab] = useState<TabId>(() => {
    const fromHash = window.location.hash.slice(1);
    return tabs.find((item) => item.id === fromHash)?.id ?? "produtos";
  });

  const selectTab = (id: TabId) => {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
  };

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
        <nav className="admin-tabs" aria-label="Seções do painel">
          {tabs.map((item) => (
            <button key={item.id} className="admin-tab" aria-current={tab === item.id ? "page" : undefined} onClick={() => selectTab(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "produtos" && <ProductsManager />}
        {tab === "galeria" && <GalleryManager />}
        {tab === "textos" && <SettingsForm />}
      </section>
    </main>
  );
}
