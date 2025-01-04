/* eslint-disable @typescript-eslint/no-explicit-any */
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

export function deepEqual(obj1: any, obj2: any): boolean {
  // Check for primitive values or reference equality
  if (obj1 === obj2) return true;

  // Check for null or undefined
  if (obj1 == null || obj2 == null) return false;

  // Check if both are objects
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  // Get keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if number of keys are different
  if (keys1.length !== keys2.length) return false;

  // Check for deep equality of keys and values
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

export function hasAllVariables(obj: any, variables: string[]) {
  return variables.every((v) => Object.keys(obj).includes(v));
}
