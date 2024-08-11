import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";
import OpenAI from "https://esm.sh/openai@4.55.4";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.25.1";

// const openai = new OpenAI();
// const anthropic = new Anthropic();

import { SuccessResponse } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return SuccessResponse("ok");
  }

  const { prompt_id, time }: { prompt_id: string; time: number } = await req
    .json();

  const before = Date.now();

  console.log("BEFORE", before, before - time);

  const authHeader = req.headers.get("Authorization")!;
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data } = await supabaseClient.from("prompts").select(
    "*, providers(*)",
  ).eq(
    "id",
    prompt_id,
  ).single();

  const after = Date.now();
  console.log("AFTER", after, after - time);

  console.log("TIME", after - before);

  return SuccessResponse(
    data,
  );
});
