import { listProfiles } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    return Response.json({ profiles: await listProfiles() });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "profiles_list_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    );
    return Response.json({ profiles: [] }, { status: 200 });
  }
}
