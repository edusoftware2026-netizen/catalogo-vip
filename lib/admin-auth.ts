import { cookies } from "next/headers";
import { requiredSecret } from "./runtime";

const COOKIE_NAME = "iam_dani_admin";
const encoder = new TextEncoder();

type AdminToken = {
  exp: number;
  telegramId: string;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signature(payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(requiredSecret("ADMIN_SIGNING_SECRET")),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(payload)),
  );
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index];
  }
  return mismatch === 0;
}

export async function createAdminToken(
  telegramId: string,
  lifetimeSeconds = 600,
): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        telegramId,
        exp: Math.floor(Date.now() / 1000) + lifetimeSeconds,
      } satisfies AdminToken),
    ),
  );
  return `${payload}.${toBase64Url(await signature(payload))}`;
}

export async function verifyAdminToken(
  token: string | undefined,
): Promise<AdminToken | null> {
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expected = await signature(payload);
  if (!constantTimeEqual(expected, fromBase64Url(suppliedSignature))) return null;
  try {
    const value = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as AdminToken;
    if (
      !value.telegramId ||
      !Number.isInteger(value.exp) ||
      value.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminToken | null> {
  const store = await cookies();
  return verifyAdminToken(store.get(COOKIE_NAME)?.value);
}

export async function setAdminSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 8 * 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
