import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";
import { Database } from "../types.ts";

export const serviceClient = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);
