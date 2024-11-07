import { z } from "zod";
import { AssistantMessageSchema } from "./components/assistant-message";

type Evaluation = {
  variables: { [key: string]: string };
  response: z.infer<typeof AssistantMessageSchema> | null;
  created_at: string;
};

type ResponseDelta = {
  delta: {
    content: string | null;
    tool_calls: {
      index: number;
      id?: string;
      type?: "function";
      function: {
        name?: string;
        arguments: string;
      };
    }[];
  };
};
