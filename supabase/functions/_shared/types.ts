import { OpenAI } from "https://esm.sh/openai@4.56.0";

export type PromptResponse = {
    id: string;
    model: string;
    message: OpenAI.Chat.ChatCompletionMessage;
    finish_reason: string | null;
    prompt_tokens?: number;
    completion_tokens?: number;
};
