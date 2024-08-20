const runners: {
  [key: string]: Runner;
} = {
  openai,
};

import { ErrorResponse, SuccessResponse } from "../_shared/response.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { openai } from "./runners/openai.ts";
import { Runner } from "./types.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return SuccessResponse("ok");
  }

  try {
    const { prompt_id, version_id, stream }: {
      prompt_id: string;
      version_id: string;
      stream?: boolean;
    } = await req
      .json();

    if (!prompt_id || !version_id) {
      return ErrorResponse("prompt_id and version_id are required", 400);
    }

    const before = Date.now();

    const { data: prompt, error: promptReadError } = await serviceClient.from(
      "prompts",
    ).select(
      "id, workspace_id, providers(id, type, options, keys(value)), params",
    ).eq(
      "id",
      prompt_id,
    ).single();

    if (promptReadError) {
      throw promptReadError;
    }

    if (!prompt.providers) {
      return ErrorResponse(
        "No provider has been linked with this prompt. Please link a provider to continue.",
        400,
      );
    }

    if (!prompt.providers.keys) {
      return ErrorResponse(
        "No API key has been linked with this provider. Please link an API key to continue.",
        400,
      );
    }

    const { data: version, error: versionReadError } = await serviceClient.from(
      "versions",
    ).select("*").eq("id", version_id).eq("prompt_id", prompt_id).single();

    if (versionReadError) {
      throw versionReadError;
    }

    const after = Date.now();

    console.log("Read time", after - before);

    if (!Object.keys(runners).includes(prompt.providers.type)) {
      return ErrorResponse("Provider not supported", 400);
    }

    const runner = runners[prompt.providers.type];

    const payload = {
      workspace_id: prompt.workspace_id,
      version_id,
      prompt_id,
      provider_id: prompt.providers.id,
      apiKey: prompt.providers.keys.value,
      options: prompt.providers.options,
      params: prompt.params,
      data: version.data,
    };

    if (stream) {
      return runner.streaming();
    } else {
      return runner.nonStreaming(payload);
    }
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
});
