import { adminIds } from "@/lib/runtime";
import {
  clearAdminSession,
  setAdminSession,
  verifyAdminToken,
} from "@/lib/admin-auth";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? undefined;
  const session = await verifyAdminToken(token);
  if (!session || !adminIds().has(session.telegramId)) {
    return new Response("Enlace administrativo inválido o vencido.", {
      status: 401,
    });
  }
  await setAdminSession(token!);
  return Response.redirect(new URL("/admin", request.url), 303);
}

export async function DELETE(request: Request): Promise<Response> {
  await clearAdminSession();
  return Response.redirect(new URL("/", request.url), 303);
}
