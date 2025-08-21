import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (_req) => {
  return new Response(
    JSON.stringify({ ok: true, now: new Date().toISOString() }),
    { headers: { "content-type": "application/json" } },
  );
});
