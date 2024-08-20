import {
  ErrorResponse,
  StreamResponse,
  SuccessResponse,
} from "../_shared/response.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { OpenAI } from "https://esm.sh/openai@4.56.0";

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

    const client = new OpenAI({
      baseURL: "https://rubeus.lavisht22.workers.dev/v1",
      apiKey: version.providers.keys.value,
      defaultHeaders: {
        "x-portkey-provider": version.providers.type,
      },
    });

    if (stream) {
      const encoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          if (!version.providers) {
            return;
          }

          const response = await client.chat.completions.create({
            messages: version.messages as unknown as Array<
              OpenAI.Chat.Completions.ChatCompletionMessageParam
            >,
            model: version.model,
            max_tokens: version.max_tokens,
            temperature: version.temperature,
            stream: true,
          });

          // response.toReadableStream();

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
      const response = await client.chat.completions.create({
        messages: version.messages as unknown as Array<
          OpenAI.Chat.Completions.ChatCompletionMessageParam
        >,
        model: version.model,
        max_tokens: version.max_tokens,
        temperature: version.temperature,
        stream: false,
      });

      return SuccessResponse(response);
    }
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
});
