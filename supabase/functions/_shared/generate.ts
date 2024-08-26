import { v4 as uuid } from "https://esm.sh/uuid@10.0.0";
import { OpenAI } from "https://esm.sh/openai@4.56.0";

import { PromptResponse } from "./types.ts";
import { StreamResponse, SuccessResponse } from "./response.ts";
import { Json } from "../types.ts";

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
    messages: Json,
    variables: VariableValues,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const castedMessages =
        messages as unknown as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    return castedMessages.map((message) => {
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
                            return {
                                ...part,
                                text: replaceVariablesInText(
                                    part.text,
                                    variables,
                                ),
                            };
                        }

                        if (part.type === "image_url") {
                            return {
                                ...part,
                                image_url: {
                                    ...part.image_url,
                                    url: replaceVariablesInText(
                                        part.image_url.url,
                                        variables,
                                    ),
                                },
                            };
                        }

                        return part;
                    });

            return {
                ...message,
                content: updatedContent,
            };
        }

        return message;
    });
}

export type Version = {
    providers: {
        type: string;
        keys: {
            value: string;
        };
    };
    messages: Json;
    model: string;
    max_tokens: number;
    temperature: number;
};

export async function generate(
    version: Version,
    stream?: boolean,
    variables?: {
        [key: string]: string;
    },
) {
    const id = uuid();

    const client = new OpenAI({
        baseURL: "https://rubeus.lavisht22.workers.dev/v1",
        apiKey: version.providers.keys.value,
        defaultHeaders: {
            "x-portkey-provider": version.providers.type,
        },
    });

    if (stream) {
        const encoder = new TextEncoder();

        const constructedResponse: PromptResponse = {
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
                    messages: applyVariables(
                        version.messages,
                        variables || {},
                    ),
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
                                completion_tokens: chunk.usage
                                    ?.completion_tokens,
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

                    constructedResponse.prompt_tokens = chunk.usage
                        ?.prompt_tokens;
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
        } as PromptResponse);
    }
}
