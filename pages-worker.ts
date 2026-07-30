import app from "./server/index.js";
import { setRuntimeEnv } from "./lib/runtime";

type Env = {
  ASSETS: Fetcher;
  DB: D1Database; // Añadir el binding de D1 al tipo Env
  // Puedes añadir otros bindings de wrangler.jsonc aquí si los usas
};

const staticAsset = /^\/(?:assets\/.*|[^/]+\.(?:css|js|map|png|jpg|jpeg|webp|svg|ico|txt))$/i;

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Establecer el entorno de ejecución para la aplicación
    setRuntimeEnv(env);

    const pathname = new URL(request.url).pathname;
    if (staticAsset.test(pathname)) {
      return env.ASSETS.fetch(request);
    }
    return app.fetch(request, env, ctx);
  },
};