const runners: {
  [key: string]: Runner;
} = {
  openai,
};

import {
  ErrorResponse,
  StreamResponse,
  SuccessResponse,
} from "../_shared/response.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { openai } from "./runners/openai.ts";
import { Runner, TextGenerateParams } from "./types.ts";

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

    // const { data: prompt, error: promptReadError } = await serviceClient.from(
    //   "prompts",
    // ).select(
    //   "id, workspace_id",
    // ).eq(
    //   "id",
    //   prompt_id,
    // ).single();

    // if (promptReadError) {
    //   throw promptReadError;
    // }

    const { data: version, error: versionReadError } = await serviceClient.from(
      "versions",
    ).select("*, providers(id, type, options, keys(value))").eq(
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

    if (!Object.keys(runners).includes(version.providers.type)) {
      return ErrorResponse("Provider not supported", 400);
    }

    const runner = runners[version.providers.type];

    const params: TextGenerateParams = {
      messages: version.messages as TextGenerateParams["messages"],
      model: version.model,
      temperature: version.temperature,
      max_tokens: version.max_tokens,
      providers: version.providers as TextGenerateParams["providers"],
    };

    if (stream) {
      const encoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          const response = await runner.text.stream(params);

          for await (const chunk of response) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
            );
          }

          controller.close();
        },
      });

      return StreamResponse(readableStream);
    } else {
      const response = await runner.text.generate(params);

      return SuccessResponse(response);
    }
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
});
