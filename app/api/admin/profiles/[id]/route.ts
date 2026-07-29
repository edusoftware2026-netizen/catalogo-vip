import { getAdminSession } from "@/lib/admin-auth";
import { updateProfile, type ProfileStatus } from "@/lib/catalog";

const statuses = new Set<ProfileStatus>([
  "draft",
  "available",
  "busy",
  "paused",
  "retired",
]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!(await getAdminSession())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body: unknown = await request.json();
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const value = body as Record<string, unknown>;
  if (
    typeof value.name !== "string" ||
    typeof value.zone !== "string" ||
    typeof value.bio !== "string" ||
    typeof value.age !== "number" ||
    value.age < 18 ||
    typeof value.price !== "number" ||
    typeof value.commission !== "number" ||
    typeof value.status !== "string" ||
    !statuses.has(value.status as ProfileStatus)
  ) {
    return Response.json({ error: "Revisa los campos del perfil" }, { status: 400 });
  }
  const { id } = await context.params;
  const profile = await updateProfile(id, {
    name: value.name.trim(),
    age: Math.trunc(value.age),
    zone: value.zone.trim(),
    price: Math.trunc(value.price),
    commission: Math.trunc(value.commission),
    bio: value.bio.trim(),
    status: value.status as ProfileStatus,
  });
  return profile
    ? Response.json({ profile })
    : Response.json({ error: "Perfil no encontrado" }, { status: 404 });
}
