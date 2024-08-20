import {
  ErrorResponse,
  StreamResponse,
  SuccessResponse,
} from "../_shared/response.ts";
import { serviceClient } from "../_shared/supabase.ts";
import { OpenAI } from "https://esm.sh/openai@4.56.0";
import { nanoid } from "https://esm.sh/nanoid@5.0.7";

type Response = {
  id: string;
  model: string;
  message: OpenAI.Chat.ChatCompletionMessage;
  finish_reason: string | null;
  prompt_tokens?: number;
  completion_tokens?: number;
};

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

    const id = nanoid();

    const client = new OpenAI({
      baseURL: "https://rubeus.lavisht22.workers.dev/v1",
      apiKey: version.providers.keys.value,
      defaultHeaders: {
        "x-portkey-provider": version.providers.type,
      },
    });

    if (stream) {
      const encoder = new TextEncoder();

      const constructedResponse: Response = {
        id,
        model: "",
        message: {
          role: "assistant",
          content: "",
          refusal: null,
        },
        finish_reason: null,
        prompt_tokens: undefined,
        completion_tokens: undefined,
      };

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

          for await (const chunk of response) {
            controller.enqueue(
              encoder.encode(`data: ${
                JSON.stringify({
                  id,
                  model: chunk.model,
                  delta: chunk.choices[0].delta,
                  finish_reason: chunk.choices[0].finish_reason,
                  prompt_tokens: chunk.usage?.prompt_tokens,
                  completion_tokens: chunk.usage?.completion_tokens,
                })
              }\n\n`),
            );

            constructedResponse.model = chunk.model;

            constructedResponse.message.content = `${
              constructedResponse.message.content || ""
            }${chunk.choices[0].delta.content || ""}`;

            constructedResponse.message.refusal =
              chunk.choices[0].delta.refusal || null;

            constructedResponse.finish_reason = chunk.choices[0]
              .finish_reason as string;

            constructedResponse.prompt_tokens = chunk.usage?.prompt_tokens;
            constructedResponse.completion_tokens = chunk.usage
              ?.completion_tokens;
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

      return SuccessResponse({
        id,
        model: response.model,
        message: response.choices[0].message,
        finish_reason: response.choices[0].finish_reason,
        prompt_tokens: response.usage?.prompt_tokens,
        completion_tokens: response.usage?.completion_tokens,
      } as Response);
    }
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
});
