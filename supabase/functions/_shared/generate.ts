import { v4 as uuid } from "https://esm.sh/uuid@10.0.0";
import { OpenAI } from "https://esm.sh/openai@4.79.4";

import { ErrorResponse, StreamResponse, SuccessResponse } from "./response.ts";
import { Json } from "../types.ts";
import { serviceClient } from "./supabase.ts";
import { mergeChunks } from "./merge.ts";

type VariableValues = Record<string, string>;

// Helper function to replace variables in a string
function replaceVariablesInText(
  text: string,
  variables: VariableValues,
): string {
  return text.replace(/{{(.*?)}}/g, (_, variableName) => {
    return variables[variableName] || `{{${variableName}}}`;
  });
}

export function applyVariables(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  variables: VariableValues,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return messages.map((message) => {
    if (message.role === "system" || message.role === "assistant") {
      // Replace variables in system/assistant messages
      return {
        ...message,
        content: replaceVariablesInText(
          message.content as string || "",
          variables,
        ),
      };
    }

    if (message.role === "user") {
      // Replace variables in user messages
      const updatedContent =
        (message.content as OpenAI.Chat.ChatCompletionContentPart[])
          .map((part) => {
            if (part.type === "text") {
              return [{
                ...part,
                text: replaceVariablesInText(
                  part.text,
                  variables,
                ),
              }];
            }

            if (part.type === "image_url") {
              const replacedUrl = replaceVariablesInText(
                part.image_url.url,
                variables,
              );

              try {
                const parsedUrls = JSON.parse(replacedUrl);
                if (
                  Array.isArray(parsedUrls) &&
                  parsedUrls.every((url) => typeof url === "string")
                ) {
                  return parsedUrls.map((url) => ({
                    type: "image_url" as const,
                    image_url: {
                      ...part.image_url,
                      url,
                    },
                  }));
                }
              } catch {
                // If parsing fails, it's not a valid JSON string, so we'll use it as is
              }

              return [{
                ...part,
                image_url: {
                  ...part.image_url,
                  url: replacedUrl,
                },
              }];
            }

            return [part];
          }).flat();

      return {
        ...message,
        content: updatedContent,
      };
    }

    return message;
  });
}

export type Version = {
  id: string | null;
  prompts: {
    id: string;
    workspace_id: string;
  };
  providers: {
    type: string;
    keys: {
      value: string;
    };
    options: Record<string, string>;
  };
  params: Json;
};

async function insertLog(
  id: string,
  workspace_id: string,
  version_id: string | null,
  request: unknown,
  response: unknown | null,
  prompt_tokens: number | null,
  completion_tokens: number | null,
  error: string | null,
) {
  await serviceClient.from("logs").insert({
    id,
    workspace_id,
    version_id,
    request,
    response,
    prompt_tokens,
    completion_tokens,
    error,
  }).throwOnError();
}

export async function generate(
  version: Version,
  stream?: boolean,
  variables?: {
    [key: string]: string;
  },
  messages?: OpenAI.Chat.ChatCompletionMessageParam[],
) {
  const id = uuid();

  // Convert options into headers
  const headers: Record<string, string> = {};

  if (version.providers.type === "azure-openai") {
    // Extract resource name from endpoint (e.g. extract "tribe" form "https://tribe.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2023-03-15-preview")
    const url = new URL(version.providers.options.endpoint);
    const resourceName = url.host.split(".")[0];

    headers["x-portkey-azure-resource-name"] = resourceName;
    headers["x-portkey-azure-deployment-id"] =
      version.providers.options.deployment;
    headers["x-portkey-azure-api-version"] =
      version.providers.options.apiVersion;
  }

  const client = new OpenAI({
    baseURL: "https://rubeus.lavisht22.workers.dev/v1",
    apiKey: version.providers.keys.value,
    defaultHeaders: {
      "x-portkey-provider": version.providers.type,
      ...headers,
    },
  });

  const params = version.params as unknown as {
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
    model: string;
    max_tokens: number;
    temperature: number;
    response_format:
      | OpenAI.ResponseFormatText
      | OpenAI.ResponseFormatJSONObject
      | OpenAI.ResponseFormatJSONSchema;
  };

  params.messages = [
    ...applyVariables(params.messages, variables || {}),
    ...(messages || []),
  ];

  try {
    if (stream) {
      const encoder = new TextEncoder();

      const response = await client.chat.completions.create({
        ...params,
        stream: true,
        stream_options: { include_usage: true },
      });

      const readableStream = new ReadableStream({
        async start(controller) {
          if (!version.providers) {
            return;
          }

          const chunks = [];

          for await (const chunk of response) {
            chunks.push(chunk);

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
            );
          }

          const mergedResponse = mergeChunks(chunks);

          await insertLog(
            id,
            version.prompts.workspace_id,
            version.id,
            params,
            mergedResponse,
            mergedResponse?.usage?.prompt_tokens || null,
            mergedResponse?.usage?.completion_tokens || null,
            null,
          );

          controller.close();
        },
      });

      return StreamResponse(readableStream);
    } else {
      const response = await client.chat.completions.create({
        ...params,
        stream: false,
      });

      await insertLog(
        id,
        version.prompts.workspace_id,
        version.id,
        params,
        response,
        response.usage?.prompt_tokens || null,
        response.usage?.completion_tokens || null,
        null,
      );

      return SuccessResponse(response);
    }
  } catch (error) {
    console.error("Error in generate function:", error);

    const errorResponse = {
      message: error instanceof Error ? error.message : String(error),
    };

    await insertLog(
      id,
      version.prompts.workspace_id,
      version.id,
      params,
      null,
      null,
      null,
      errorResponse.message,
    );

    return ErrorResponse(errorResponse.message);
  }
}
