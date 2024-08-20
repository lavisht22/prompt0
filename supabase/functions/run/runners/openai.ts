import OpenAI from "https://esm.sh/v135/openai@4.55.4/index.js";
import { Runner, TextGenerateParams } from "../types.ts";
import { Stream } from "https://esm.sh/v135/openai@4.55.4/streaming.js";

const transformParams = (params: TextGenerateParams) => {
    return {
        messages: params.messages as Array<
            OpenAI.Chat.ChatCompletionMessageParam
        >,
        model: params.model as OpenAI.Chat.ChatModel,
        temperature: params.temperature,
        max_tokens: params.max_tokens,
    };
};

async function* transformStream(
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
): AsyncIterable<{ delta: string }> {
    for await (const entry of stream) {
        if (entry.choices.length === 0) {
            continue;
        }

        yield {
            delta: entry.choices[0].delta.content || "",
        };
    }
}

export const openai: Runner = {
    text: {
        generate: async (params) => {
            const { providers } = params;

            const client = new OpenAI({
                ...providers.options,
                apiKey: providers.keys.value,
            });

            const response = await client.chat.completions.create({
                ...transformParams(params),
                stream: false,
            });

            return {
                content: response.choices[0].message.content || "",
                usage: {
                    input_tokens: response.usage?.prompt_tokens,
                    output_tokens: response.usage?.completion_tokens,
                },
            };
        },

        stream: async (params) => {
            const { providers } = params;

            const client = new OpenAI({
                ...providers.options,
                apiKey: providers.keys.value,
            });

            const response = await client.chat.completions.create({
                ...transformParams(params),
                stream: true,
            });

            return transformStream(response);
        },
    },
};
