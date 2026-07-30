let _env: CatalogRuntime | undefined;

export type CatalogRuntime = {
  ADMIN_SIGNING_SECRET?: string;
  ADMIN_TELEGRAM_IDS?: string;
  APP_BASE_URL?: string;
  BOT_TOKEN?: string;
  BOT_USERNAME?: string;
  CHANNEL_ID?: string;
  DB: D1Database;
  MEDIA?: R2Bucket;
  TELEGRAM_WEBHOOK_SECRET?: string;
};

export function setRuntimeEnv(env: CatalogRuntime) {
  _env = env;
}

export function runtime(): CatalogRuntime {
  if (!_env) {
    throw new Error("Runtime environment not set. Ensure setRuntimeEnv is called.");
  }
  return _env;
}

export function requiredSecret(
  key:
    | "ADMIN_SIGNING_SECRET"
    | "BOT_TOKEN"
    | "TELEGRAM_WEBHOOK_SECRET",
): string {
  const value = runtime()[key];
  if (!value) throw new Error(`Missing required runtime secret: ${key}`);
  return value;
}

export function adminIds(): Set<string> {
  return new Set(
    (runtime().ADMIN_TELEGRAM_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}