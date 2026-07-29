import { runtime } from "./runtime";

export type ProfileStatus =
  | "draft"
  | "available"
  | "busy"
  | "paused"
  | "retired";

export type CatalogProfile = {
  age: number;
  bio: string;
  commission: number;
  createdAt: string;
  id: string;
  name: string;
  photoUrl: string | null;
  price: number;
  status: ProfileStatus;
  updatedAt: string;
  zone: string;
};

type ProfileRow = {
  age: number;
  bio: string;
  commission: number;
  created_at: string;
  id: string;
  name: string;
  photo_key: string | null;
  price: number;
  status: ProfileStatus;
  updated_at: string;
  zone: string;
};

function mapProfile(row: ProfileRow): CatalogProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    zone: row.zone,
    price: row.price,
    commission: row.commission,
    bio: row.bio,
    status: row.status,
    photoUrl: row.photo_key ? `/media/${encodeURIComponent(row.photo_key)}` : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProfiles(
  includeUnpublished = false,
): Promise<CatalogProfile[]> {
  const query = includeUnpublished
    ? `SELECT id, name, age, zone, price, commission, bio, status,
        photo_key, created_at, updated_at
       FROM profiles ORDER BY updated_at DESC`
    : `SELECT id, name, age, zone, price, commission, bio, status,
        photo_key, created_at, updated_at
       FROM profiles
       WHERE status IN ('available', 'busy')
       ORDER BY CASE status WHEN 'available' THEN 0 ELSE 1 END, updated_at DESC`;
  const result = await runtime().DB.prepare(query).all<ProfileRow>();
  return result.results.map(mapProfile);
}

export async function getProfile(
  id: string,
): Promise<CatalogProfile | null> {
  const row = await runtime()
    .DB.prepare(
      `SELECT id, name, age, zone, price, commission, bio, status,
       photo_key, created_at, updated_at
       FROM profiles WHERE id = ?1`,
    )
    .bind(id)
    .first<ProfileRow>();
  return row ? mapProfile(row) : null;
}

export async function createProfile(input: {
  age: number;
  bio: string;
  commission: number;
  name: string;
  photoKey?: string | null;
  price: number;
  status?: ProfileStatus;
  zone: string;
}): Promise<CatalogProfile> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await runtime()
    .DB.prepare(
      `INSERT INTO profiles
       (id, name, age, zone, price, commission, bio, status, photo_key, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
    )
    .bind(
      id,
      input.name,
      input.age,
      input.zone,
      input.price,
      input.commission,
      input.bio,
      input.status ?? "draft",
      input.photoKey ?? null,
      now,
      now,
    )
    .run();
  const profile = await getProfile(id);
  if (!profile) throw new Error("Profile was not created");
  return profile;
}

export async function updateProfile(
  id: string,
  input: {
    age: number;
    bio: string;
    commission: number;
    name: string;
    price: number;
    status: ProfileStatus;
    zone: string;
  },
): Promise<CatalogProfile | null> {
  const now = new Date().toISOString();
  await runtime()
    .DB.prepare(
      `UPDATE profiles
       SET name = ?1, age = ?2, zone = ?3, price = ?4, commission = ?5,
           bio = ?6, status = ?7, updated_at = ?8
       WHERE id = ?9`,
    )
    .bind(
      input.name,
      input.age,
      input.zone,
      input.price,
      input.commission,
      input.bio,
      input.status,
      now,
      id,
    )
    .run();
  return getProfile(id);
}

export async function createBookingRequest(input: {
  customerName: string | null;
  profileId: string;
  telegramUserId: string;
  telegramUsername: string | null;
}): Promise<string> {
  const id = `SCZ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  await runtime()
    .DB.prepare(
      `INSERT INTO booking_requests
       (id, profile_id, telegram_user_id, telegram_username, customer_name, status, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, 'new', ?6, ?6)`,
    )
    .bind(
      id,
      input.profileId,
      input.telegramUserId,
      input.telegramUsername,
      input.customerName,
      now,
    )
    .run();
  return id;
}
