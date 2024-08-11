import { useState } from "react";

type Prompt = {
  id: string;
  slug: string;
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  return (
    <div>
      <div className="flex items-center bg-background px-4 h-12 border-b">
        <h2 className="font-semibold">Prompts</h2>
      </div>
    </div>
  );
}
