import { z } from "zod";
import { AssistantMessageSchema } from "./components/assistant-message";

type Evaluation = {
  variables: { [key: string]: string };
  response: z.infer<typeof AssistantMessageSchema>;
  created_at: string;
};
