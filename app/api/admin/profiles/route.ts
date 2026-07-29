import { createProfile, listProfiles } from "@/lib/catalog";
import { getAdminSession } from "@/lib/admin-auth";

const MAX_BODY_BYTES = 32_000;

function validNumber(value: unknown, minimum: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum;
}

export async function GET(): Promise<Response> {
  if (!(await getAdminSession())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  return Response.json({ profiles: await listProfiles(true) });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await getAdminSession())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) {
    return Response.json({ error: "Solicitud demasiado grande" }, { status: 413 });
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
    !validNumber(value.age, 18) ||
    !validNumber(value.price, 0) ||
    !validNumber(value.commission, 0)
  ) {
    return Response.json({ error: "Revisa los campos del perfil" }, { status: 400 });
  }
  const profile = await createProfile({
    name: value.name.trim(),
    age: value.age,
    zone: value.zone.trim(),
    price: value.price,
    commission: value.commission,
    bio: value.bio.trim(),
  });
  return Response.json({ profile }, { status: 201 });
}
