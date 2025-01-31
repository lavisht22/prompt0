import { OpenAI } from "https://esm.sh/openai@4.81.0";

export type ChatResponse = {
    id: string;
    model: string;
    message: OpenAI.Chat.ChatCompletionMessage;
    finish_reason: string | null;
    prompt_tokens?: number;
    completion_tokens?: number;
};
