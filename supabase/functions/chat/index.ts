import { OpenAI } from "https://esm.sh/openai@4.57.0";

import { generate, Version } from "../_shared/generate.ts";
import { ErrorResponse, SuccessResponse } from "../_shared/response.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return SuccessResponse("ok");
  }
  try {
    const api_key = req.headers.get("x-api-key");

    if (!api_key) {
      return ErrorResponse(
        "Missing API key in headers. Include it in x-api-key header",
        401,
      );
    }

    const before = Date.now();

    const { prompt_id, stream, variables, messages }: {
      prompt_id: string;
      stream?: boolean;
      variables?: {
        [key: string]: string;
      };
      messages?: OpenAI.Chat.ChatCompletionMessageParam[];
    } = await req
      .json();

    if (!prompt_id) {
      return ErrorResponse("prompt_id is required", 400);
    }

    const { data: prompt, error: promptReadError } = await serviceClient.from(
      "prompts",
    ).select(
      "id, workspace_id, versions(*, providers(id, type, options, keys(value))), workspaces(api_keys(*))",
    ).eq(
      "id",
      prompt_id,
    ).not("versions.published_at", "is", null).single();

    if (promptReadError) {
      throw promptReadError;
    }

    if (
      !prompt.workspaces ||
      !prompt.workspaces.api_keys.find((a) => a.id === api_key)
    ) {
      return ErrorResponse("Unauthorized", 401);
    }

    if (prompt.versions.length === 0) {
      return ErrorResponse(
        "No versions of the prompt are published. Please publish a version to continue.",
        400,
      );
    }

    if (prompt.versions.length > 1) {
      throw new Error(
        "An internal error occured. Multiple versions of the prompt are published. Please contact support.",
      );
    }

    const version = prompt.versions[0];

    if (!version.providers) {
      return ErrorResponse(
        "No provider has been linked with this prompt. Please link a provider to continue.",
        400,
      );
    }

    if (!version.providers.keys) {
      return ErrorResponse(
        "No API key has been linked with this provider. Please link an API key to continue.",
        400,
      );
    }

    const after = Date.now();

    console.log("Read time", after - before);

    return generate(
      {
        ...version,
        prompts: {
          id: prompt.id,
          workspace_id: prompt.workspace_id,
        },
      } as Version,
      stream,
      variables,
      messages,
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
});
