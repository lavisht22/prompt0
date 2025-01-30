import { ErrorResponse, SuccessResponse } from "../_shared/response.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { generate, Version } from "../_shared/generate.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return SuccessResponse("ok");
  }

  try {
    const { provider_id, workspace_id, prompt, variables, stream }: {
      workspace_id: string;
      provider_id: string;
      prompt: string;
      stream?: boolean;
      variables?: {
        [key: string]: string;
      };
    } = await req
      .json();

    if (!prompt || !provider_id || !workspace_id) {
      return ErrorResponse(
        "prompt, provider_id and workspace_id are required",
        400,
      );
    }

    const before = Date.now();

    const { data: provider, error: providerReadError } = await serviceClient
      .from(
        "providers",
      ).select(
        "id, type, options, keys(value)",
      ).eq(
        "id",
        provider_id,
      ).single();

    if (providerReadError) {
      throw providerReadError;
    }
    if (!provider.keys) {
      return ErrorResponse(
        "No API key has been linked with this provider. Please link an API key to continue.",
        400,
      );
    }

    const after = Date.now();

    console.log("Read time", after - before);

    return generate(
      {
        id: null,
        prompts: {
          id: "",
          workspace_id,
        },
        providers: provider,
        params: prompt,
      } as Version,
      stream,
      variables,
    );
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return ErrorResponse(error.message, 500);
    }
    return ErrorResponse("An unknown error occurred", 500);
  }
});
