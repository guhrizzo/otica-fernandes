"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStoreStatus, parseStoreHours } from "@/lib/store-hours";
import type { StoreHours } from "@/lib/store-hours";

type Variant = "pill" | "band";

/**
 * Mostra se a loja está aberta agora. O horário vem do painel (tabela store_hours):
 * o servidor entrega o valor inicial e o navegador confere de novo no Supabase,
 * então uma mudança no painel (ex.: "fechar agora") aparece sem esperar o cache da página.
 */
export default function StoreStatus({ hours: initial, variant = "pill" }: { hours: StoreHours; variant?: Variant }) {
  const [hours, setHours] = useState(initial);
  // A hora só existe no navegador; até lá não se mostra aberto nem fechado para não errar no servidor.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0);
    const tick = setInterval(() => setNow(new Date()), 30_000);

    const refresh = async () => {
      if (!supabase) return;
      const { data, error } = await supabase.from("store_hours").select("schedule, force_closed, notice").maybeSingle();
      if (!error && data) setHours(parseStoreHours(data));
    };
    refresh();
    const poll = setInterval(refresh, 60_000);

    return () => {
      clearTimeout(first);
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  const status = now ? getStoreStatus(hours, now) : null;
  const state = status ? (status.open ? "is-open" : "is-closed") : "is-pending";
  const notice = status && !hours.force_closed ? hours.notice : "";

  if (variant === "band") {
    return (
      <>
        <strong className={`store-status-title ${state}`}>
          <i className="store-status-dot" aria-hidden />
          {status ? status.label : "Horário"}
        </strong>
        <span aria-live="polite">{status ? status.detail : " "}</span>
        {notice && <span className="store-status-notice">{notice}</span>}
      </>
    );
  }

  return (
    <span className={`store-status ${state}`} role="status" title={notice || status?.detail}>
      <i className="store-status-dot" aria-hidden />
      <span className="store-status-label">{status ? status.label : "Horário"}</span>
      {status && <span className="store-status-detail">· {status.detail}</span>}
    </span>
  );
}
