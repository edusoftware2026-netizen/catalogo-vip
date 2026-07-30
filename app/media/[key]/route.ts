import { runtime } from "@/lib/runtime";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
): Promise<Response> {
  const { key } = await context.params;
  const media = runtime().MEDIA;
  if (!media) {
    return new Response("Almacenamiento de imágenes no configurado", { status: 404 });
  }
  const object = await media.get(key);
  if (!object) return new Response("Imagen no encontrada", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=3600");
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}
