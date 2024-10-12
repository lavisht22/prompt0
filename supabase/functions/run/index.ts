import { OpenAI } from "https://esm.sh/openai@4.57.0";

import { ErrorResponse, SuccessResponse } from "../_shared/response.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { generate, Version } from "../_shared/generate.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return SuccessResponse("ok");
  }

  try {
    const { prompt_id, version_id, stream, variables, messages }: {
      prompt_id: string;
      version_id: string;
      stream?: boolean;
      variables?: {
        [key: string]: string;
      };
      messages?: OpenAI.Chat.ChatCompletionMessageParam[];
    } = await req
      .json();

    if (!prompt_id || !version_id) {
      return ErrorResponse("prompt_id and version_id are required", 400);
    }

    const before = Date.now();

    const { data: version, error: versionReadError } = await serviceClient.from(
      "versions",
    ).select(
      "*, providers(id, type, options, keys(value)), prompts(id, workspace_id)",
    ).eq(
      "id",
      version_id,
    ).eq("prompt_id", prompt_id).single();

    if (versionReadError) {
      throw versionReadError;
    }

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

    return generate(version as Version, stream, variables, messages);
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
});
