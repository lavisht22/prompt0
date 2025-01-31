import { OpenAI } from "https://esm.sh/openai@4.81.0";

export function mergeChunks(
    chunks: OpenAI.Chat.Completions.ChatCompletionChunk[],
): OpenAI.Chat.Completions.ChatCompletion {
    if (chunks.length === 0) {
        throw new Error("No chunks to merge");
    }

    const output = {
        id: "",
        object: "chat.completion",
        model: "",
        choices: [],
        created: 0,
    } as OpenAI.Chat.Completions.ChatCompletion;

    const mergedChoices = new Map<number, OpenAI.Chat.ChatCompletion.Choice>();

    const mergedToolCalls = new Map<
        string,
        OpenAI.Chat.Completions.ChatCompletionMessageToolCall
    >();

    for (const chunk of chunks) {
        if (chunk.id) {
            output.id = chunk.id;
        }

        if (chunk.model) {
            output.model = chunk.model;
        }

        if (chunk.created) {
            output.created = chunk.created;
        }

        if (chunk.usage) {
            output.usage = chunk.usage;
        }

        if (chunk.service_tier) {
            output.service_tier = chunk.service_tier;
        }

        if (chunk.system_fingerprint) {
            output.system_fingerprint = chunk.system_fingerprint;
        }

        for (const choice of chunk.choices) {
            if (!mergedChoices.has(choice.index)) {
                mergedChoices.set(choice.index, {
                    index: choice.index,
                    message: {
                        content: null,
                        tool_calls: [],
                        role: "assistant",
                        refusal: null,
                    },
                    logprobs: null,
                    finish_reason: "stop",
                });
            }

            const existingChoice = mergedChoices.get(choice.index);

            if (!existingChoice) {
                continue;
            }

            if (choice.finish_reason) {
                existingChoice.finish_reason = choice.finish_reason;
            }

            if (choice.logprobs) {
                existingChoice.logprobs = choice.logprobs;
            }

            if (choice.delta.refusal) {
                existingChoice.message.refusal = choice.delta.refusal;
            }

            if (choice.delta.content) {
                if (!existingChoice.message.content) {
                    existingChoice.message.content = "";
                }

                existingChoice.message.content += choice.delta.content;
            }

            if (choice.delta.tool_calls) {
                for (const toolCall of choice.delta.tool_calls) {
                    if (
                        !mergedToolCalls.has(
                            `${choice.index}-${toolCall.index}`,
                        )
                    ) {
                        mergedToolCalls.set(
                            `${choice.index}-${toolCall.index}`,
                            {
                                id: toolCall.id || "",
                                type: toolCall.type || "function",
                                function: {
                                    name: toolCall.function?.name || "",
                                    arguments: toolCall.function?.arguments ||
                                        "",
                                },
                            },
                        );
                    }

                    const existingToolCall = mergedToolCalls.get(
                        `${choice.index}-${toolCall.index}`,
                    );

                    if (!existingToolCall) {
                        continue;
                    }

                    if (toolCall.id) {
                        existingToolCall.id = toolCall.id;
                    }

                    if (toolCall.function?.name) {
                        existingToolCall.function.name +=
                            toolCall.function.name;
                    }

                    if (toolCall.function?.arguments) {
                        existingToolCall.function.arguments +=
                            toolCall.function.arguments;
                    }

                    mergedToolCalls.set(
                        `${choice.index}-${toolCall.index}`,
                        existingToolCall,
                    );
                }
            }
        }
    }

    const toolCallsArr = Array.from(mergedToolCalls).map(([key, toolCall]) => ({
        key,
        toolCall,
    }));

    const choices = Array.from(mergedChoices).map(([, choice]) => choice)
        .map((choice) => {
            const tool_calls = toolCallsArr.filter((item) =>
                item.key.startsWith(`${choice.index}-`)
            ).map((item) => item.toolCall);

            return {
                ...choice,
                tool_calls,
            };
        });

    return {
        ...output,
        choices,
    };
}
