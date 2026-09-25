"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fallbackSettings } from "@/lib/site-data";
import type { SiteSettings } from "@/lib/site-data";
import { revalidateHome } from "./actions";

type Field = {
  key: keyof SiteSettings;
  label: string;
  hint?: string;
  multiline?: boolean;
  inputMode?: "numeric";
};

const sections: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Início",
    description: "Topo da página, logo abaixo do menu.",
    fields: [
      { key: "hero_eyebrow", label: "Frase de destaque", hint: "Texto curto em vermelho acima do título." },
      { key: "hero_text", label: "Texto de apresentação", multiline: true },
    ],
  },
  {
    title: "Nossa história",
    description: "Seção “História”.",
    fields: [
      { key: "story_text", label: "Texto", multiline: true },
      { key: "story_years", label: "Anos de história", hint: "Aparece em destaque, seguido da palavra “anos”.", inputMode: "numeric" },
    ],
  },
  {
    title: "Horário de funcionamento",
    description: "Seção de contato.",
    fields: [
      { key: "hours_weekday", label: "Dias de semana" },
      { key: "hours_saturday", label: "Sábado" },
    ],
  },
  {
    title: "WhatsApp",
    description: "Botão flutuante e links de WhatsApp das lojas.",
    fields: [
      { key: "whatsapp_number", label: "Número do botão flutuante", hint: "Com código do país e DDD, só números. Ex.: 5514999040617", inputMode: "numeric" },
      { key: "whatsapp_message", label: "Mensagem inicial", hint: "Já vem escrita quando o cliente abre a conversa." },
    ],
  },
];

export default function SettingsForm() {
  const [values, setValues] = useState<SiteSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("site_settings")
      .select("*")
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (loadError) setError(`Não foi possível carregar os textos: ${loadError.message}`);
        // Sem linha no banco ainda: parte dos textos que o site já mostra hoje.
        setValues({ ...fallbackSettings, ...(data ?? {}) });
      });
  }, []);

  const update = (key: keyof SiteSettings, value: string) => {
    setSaved(false);
    setValues((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !values) return;

    const whatsappNumber = values.whatsapp_number.replace(/\D/g, "");
    if (whatsappNumber.length < 12) {
      setError("Número do WhatsApp incompleto. Use código do país + DDD + número, ex.: 5514999040617.");
      return;
    }

    setSaving(true);
    setError(null);

    const trimmed = Object.fromEntries(
      (Object.keys(fallbackSettings) as (keyof SiteSettings)[]).map((key) => [key, values[key].trim()])
    ) as SiteSettings;
    const row = { ...trimmed, whatsapp_number: whatsappNumber };

    const { error: saveError } = await supabase
      .from("site_settings")
      .upsert({ id: true, ...row, updated_at: new Date().toISOString() });

    setSaving(false);
    if (saveError) {
      setError(`Não foi possível salvar: ${saveError.message}`);
      return;
    }
    setValues(row);
    setSaved(true);
    await revalidateHome();
  };

  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1>Textos do site</h1>
          <p className="admin-muted">Textos de apresentação, horários e WhatsApp.</p>
        </div>
      </div>

      {!values ? (
        <p className="admin-muted">Carregando textos…</p>
      ) : (
        <form className="admin-settings" onSubmit={handleSubmit}>
          {sections.map((section) => (
            <fieldset className="admin-card admin-fieldset" key={section.title}>
              <legend>{section.title}</legend>
              <p className="admin-muted admin-fieldset-description">{section.description}</p>
              {section.fields.map((field) => (
                <label key={field.key}>
                  {field.label}
                  {field.multiline ? (
                    <textarea required rows={4} value={values[field.key]} onChange={(e) => update(field.key, e.target.value)} />
                  ) : (
                    <input required inputMode={field.inputMode} value={values[field.key]} onChange={(e) => update(field.key, e.target.value)} />
                  )}
                  {field.hint && <small>{field.hint}</small>}
                </label>
              ))}
            </fieldset>
          ))}

          <div className="admin-save-bar">
            {error && <p className="admin-error" role="alert">{error}</p>}
            {saved && !error && <p className="admin-success" role="status"><Check size={16} /> Textos salvos. O site já foi atualizado.</p>}
            <button type="submit" className="button button-red" disabled={saving}>{saving ? "Salvando…" : "Salvar textos"}</button>
          </div>
        </form>
      )}
    </>
  );
}
