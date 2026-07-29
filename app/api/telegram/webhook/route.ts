import { createAdminToken } from "@/lib/admin-auth";
import { createBookingRequest, createProfile, getProfile } from "@/lib/catalog";
import { adminIds, requiredSecret, runtime } from "@/lib/runtime";

type TelegramUser = { id: number; first_name?: string; username?: string };
type TelegramMessage = { chat: { id: number }; from?: TelegramUser; text?: string };
type TelegramUpdate = { message?: TelegramMessage };
type Draft = { stage: string; payload: Record<string, unknown> };

async function telegram(method: string, body: Record<string, unknown>) {
  const response = await fetch(`https://api.telegram.org/bot${requiredSecret("BOT_TOKEN")}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Telegram ${method} failed`);
}

async function say(chatId: number, text: string) {
  await telegram("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true });
}

async function getDraft(userId: string): Promise<Draft | null> {
  const row = await runtime().DB.prepare("SELECT stage, payload FROM bot_drafts WHERE telegram_user_id = ?1").bind(userId).first<{stage:string;payload:string}>();
  return row ? { stage: row.stage, payload: JSON.parse(row.payload) } : null;
}

async function saveDraft(userId: string, draft: Draft | null) {
  if (!draft) {
    await runtime().DB.prepare("DELETE FROM bot_drafts WHERE telegram_user_id = ?1").bind(userId).run();
    return;
  }
  await runtime().DB.prepare(`INSERT INTO bot_drafts (telegram_user_id, stage, payload, updated_at)
    VALUES (?1, ?2, ?3, ?4) ON CONFLICT(telegram_user_id) DO UPDATE SET stage=?2, payload=?3, updated_at=?4`)
    .bind(userId, draft.stage, JSON.stringify(draft.payload), new Date().toISOString()).run();
}

async function handleAdmin(message: TelegramMessage, user: TelegramUser, text: string) {
  const userId = String(user.id);
  if (text === "/panel") {
    const base = runtime().APP_BASE_URL;
    if (!base) return say(message.chat.id, "El panel todavía no tiene una URL configurada.");
    const token = await createAdminToken(userId);
    return say(message.chat.id, `🔐 <b>Acceso administrativo</b>\n\nEste enlace personal vence en 10 minutos:\n${base}/api/admin/session?token=${encodeURIComponent(token)}`);
  }
  if (text === "/cancelar") {
    await saveDraft(userId, null);
    return say(message.chat.id, "Operación cancelada.");
  }
  if (text === "/nuevo") {
    await saveDraft(userId, { stage: "name", payload: {} });
    return say(message.chat.id, "Nuevo perfil. Escribe el <b>nombre público</b>.\n\n/cancelar para salir.");
  }
  const draft = await getDraft(userId);
  if (!draft) return say(message.chat.id, "Comandos disponibles:\n/nuevo — crear perfil\n/panel — abrir administración");

  const next: Record<string, { stage: string; prompt: string }> = {
    name: { stage: "age", prompt: "Edad (debe ser 18 o mayor):" },
    age: { stage: "zone", prompt: "Zona general (sin dirección exacta):" },
    zone: { stage: "price", prompt: "Tarifa referencial en Bs (solo número):" },
    price: { stage: "commission", prompt: "Comisión en Bs (solo número):" },
    commission: { stage: "bio", prompt: "Descripción breve del perfil:" },
  };
  if (draft.stage in next) {
    const numeric = ["age", "price", "commission"].includes(draft.stage);
    const value = numeric ? Number(text) : text.trim();
    if ((numeric && (!Number.isInteger(value) || Number(value) < (draft.stage === "age" ? 18 : 0))) || (!numeric && !value)) {
      return say(message.chat.id, "Valor no válido. Inténtalo nuevamente.");
    }
    draft.payload[draft.stage] = value;
    const transition = next[draft.stage];
    draft.stage = transition.stage;
    await saveDraft(userId, draft);
    return say(message.chat.id, transition.prompt);
  }
  if (draft.stage === "bio") {
    draft.payload.bio = text.trim();
    const profile = await createProfile({
      name: String(draft.payload.name), age: Number(draft.payload.age), zone: String(draft.payload.zone),
      price: Number(draft.payload.price), commission: Number(draft.payload.commission), bio: String(draft.payload.bio),
      status: "draft",
    });
    await saveDraft(userId, null);
    return say(message.chat.id, `✅ Perfil <b>${profile.name}</b> creado como borrador.\n\nUsa /panel para revisarlo y publicarlo.`);
  }
}

async function handleCustomer(message: TelegramMessage, user: TelegramUser, text: string) {
  const match = text.match(/^\/start perfil_([a-f0-9-]{20,})$/i);
  if (!match) return say(message.chat.id, "Bienvenido al catálogo. Elige un perfil en la página y pulsa “Solicitar disponibilidad”.");
  const profile = await getProfile(match[1]);
  if (!profile || !["available", "busy"].includes(profile.status)) return say(message.chat.id, "Este perfil ya no está publicado.");
  const requestId = await createBookingRequest({
    profileId: profile.id, telegramUserId: String(user.id), telegramUsername: user.username ?? null, customerName: user.first_name ?? null,
  });
  await say(message.chat.id, `✅ Solicitud <b>${requestId}</b> registrada para <b>${profile.name}</b>.\n\nUna administradora verificará la disponibilidad y te escribirá por privado. No envíes pagos hasta recibir confirmación.`);
  const contact = user.username ? `@${user.username}` : `<a href="tg://user?id=${user.id}">${user.first_name ?? "Cliente"}</a>`;
  await Promise.all([...adminIds()].map((id) => say(Number(id), `🔔 <b>Nueva solicitud ${requestId}</b>\nPerfil: ${profile.name}\nCliente: ${contact}\n\nLa coordinación y verificación se realizan manualmente.`)));
}

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get("x-telegram-bot-api-secret-token") !== requiredSecret("TELEGRAM_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const update = await request.json() as TelegramUpdate;
  const message = update.message;
  const user = message?.from;
  const text = message?.text?.trim();
  if (!message || !user || !text) return Response.json({ ok: true });
  if (adminIds().has(String(user.id))) await handleAdmin(message, user, text);
  else await handleCustomer(message, user, text);
  return Response.json({ ok: true });
}
