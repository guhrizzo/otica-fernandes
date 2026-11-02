/** Horário de um dia: "HH:MM" de abertura e fechamento, ou null quando a loja não abre. */
export type DayHours = { open: string; close: string } | null;

export type StoreHours = {
  /** 7 posições, de domingo (0) a sábado (6), como Date.getDay(). */
  schedule: DayHours[];
  /** Quando ligado, o site mostra "Fechado" mesmo dentro do horário (feriado, imprevisto). */
  force_closed: boolean;
  /** Aviso opcional cadastrado no painel, mostrado junto ao status. */
  notice: string;
};

export const defaultStoreHours: StoreHours = {
  schedule: [
    null,
    { open: "09:00", close: "18:00" },
    { open: "09:00", close: "18:00" },
    { open: "09:00", close: "18:00" },
    { open: "09:00", close: "18:00" },
    { open: "09:00", close: "18:00" },
    { open: "09:00", close: "13:00" },
  ],
  force_closed: false,
  notice: "",
};

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** "09:00" → "9h", "09:30" → "9h30". */
export const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
};

/** Aceita o que veio do banco e devolve um horário válido; qualquer problema cai no padrão. */
export function parseStoreHours(raw: unknown): StoreHours {
  if (typeof raw !== "object" || raw === null) return defaultStoreHours;
  const row = raw as Record<string, unknown>;
  const schedule = Array.isArray(row.schedule) && row.schedule.length === 7
    ? row.schedule.map((day): DayHours => {
        if (typeof day !== "object" || day === null) return null;
        const { open, close } = day as Record<string, unknown>;
        if (typeof open !== "string" || typeof close !== "string") return null;
        if (!TIME.test(open) || !TIME.test(close) || toMinutes(open) >= toMinutes(close)) return null;
        return { open, close };
      })
    : defaultStoreHours.schedule;
  return {
    schedule,
    force_closed: row.force_closed === true,
    notice: typeof row.notice === "string" ? row.notice.trim() : "",
  };
}

export type StoreStatusInfo = {
  open: boolean;
  /** "Aberto agora" ou "Fechado". */
  label: string;
  /** "Fecha às 18h", "Abre amanhã às 9h"… */
  detail: string;
};

const TIME_ZONE = "America/Sao_Paulo";
const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** Dia da semana e minutos desde a meia-noite no horário de Brasília, independente do fuso do visitante. */
function nowInStoreZone(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function getStoreStatus(hours: StoreHours, now: Date = new Date()): StoreStatusInfo {
  if (hours.force_closed) {
    return { open: false, label: "Fechado", detail: hours.notice || "Fechado hoje" };
  }

  const { day, minutes } = nowInStoreZone(now);
  const today = hours.schedule[day];

  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, label: "Aberto agora", detail: `Fecha às ${formatTime(today.close)}` };
  }

  if (today && minutes < toMinutes(today.open)) {
    return { open: false, label: "Fechado", detail: `Abre hoje às ${formatTime(today.open)}` };
  }

  for (let ahead = 1; ahead <= 7; ahead++) {
    const next = hours.schedule[(day + ahead) % 7];
    if (!next) continue;
    const when = ahead === 1 ? "amanhã" : WEEKDAYS[(day + ahead) % 7];
    return { open: false, label: "Fechado", detail: `Abre ${when} às ${formatTime(next.open)}` };
  }

  return { open: false, label: "Fechado", detail: "Consulte nossos horários" };
}
