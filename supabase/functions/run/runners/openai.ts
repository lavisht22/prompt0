import OpenAI from "https://esm.sh/v135/openai@4.55.4/index.js";
import { Runner } from "../types.ts";
import { serviceClient } from "../../_shared/supabase.ts";
import { StreamResponse, SuccessResponse } from "../../_shared/response.ts";

export const openai: Runner = {
    nonStreaming: async (
        payload,
    ) => {
        const { workspace_id, version_id, apiKey, options, params, data } =
            payload;

        const client = new OpenAI({ ...options, apiKey });

        const request = {
            ...params,
            ...data,
        };

        const response = await client.chat.completions.create({
            ...request,
            stream: false,
        });

        await serviceClient.from("logs").insert({
            workspace_id,
            version_id,
            provider: {
                type: "openai",
                ...options,
            },
            request,
            response: {
                content: response.choices[0].message.content,
            },
            input_tokens: response.usage?.prompt_tokens || 0,
            output_tokens: response.usage?.completion_tokens || 0,
            cost: 0,
        });

        return SuccessResponse({
            content: response.choices[0].message.content,
            usage: {
                input_tokens: response.usage?.prompt_tokens,
                output_tokens: response.usage?.completion_tokens,
            },
        });
    },
    streaming: (payload) => {
        const stream = new ReadableStream({
            async start(controller) {
                const {
                    workspace_id,
                    version_id,
                    apiKey,
                    options,
                    params,
                    data,
                } = payload;

                const client = new OpenAI({ ...options, apiKey });

                const request = {
                    ...params,
                    ...data,
                };

                const response = await client.chat.completions.create({
                    ...request,
                    stream: true,
                });

                for await (const part of response) {
                    process.stdout.write(part.choices[0]?.delta?.content || "");
                }
            },
        });

        return StreamResponse(stream);
    },
};
