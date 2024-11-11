import { FormValues } from "routes/$worskpaceSlug.prompts.$id/prompt";

// Function to extract {{VARIABLES}} from a string
export function extractVariables(string: string): string[] {
  const regex = /{{(.*?)}}/g;
  const matches = [...string.matchAll(regex)];
  return matches.map((match) => match[1]);
}

export function extractVaraiblesFromMessages(messages: FormValues["messages"]) {
  const arr: string[] = [];

  messages.forEach((message) => {
    if (message.role === "system" || message.role === "assistant") {
      arr.push(...extractVariables(message.content || ""));
    }

    if (message.role === "user") {
      message.content.forEach((part) => {
        if (part.type === "text") {
          arr.push(...extractVariables(part.text));
        }

        if (part.type === "image_url") {
          arr.push(...extractVariables(part.image_url.url));
        }
      });
    }
  });

  return arr;
}
