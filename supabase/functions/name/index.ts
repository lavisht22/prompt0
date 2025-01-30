import { ErrorResponse, SuccessResponse } from "../_shared/response.ts";
import { OpenAI } from "https://esm.sh/openai@4.56.0";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return SuccessResponse("ok");
  }

  try {
    const { messages }: { messages: unknown } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            `You are tasked with generating a name for a prompt. The name should be a short, concise title that accurately describes the prompt. The name should be in a format that is easy to read and understand. Only output the name and nothing else. Here is the prompt: ${
              JSON.stringify(messages)
            }`,
        },
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    const name = response.choices[0].message.content;

    return SuccessResponse({ name });
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
});
