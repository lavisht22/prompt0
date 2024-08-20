import OpenAI from "https://esm.sh/v135/openai@4.55.4/index.js";
import { Runner, TextGenerateParams } from "../types.ts";

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
    },
};
