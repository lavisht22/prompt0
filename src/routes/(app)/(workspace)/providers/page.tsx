import { useCallback, useEffect, useState } from "react";
import supabase from "../../../../utils/supabase";

type Prompt = {
  id: string;
  slug: string;
};

export default function ProvidersPage() {
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.from("providers").select("id");
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {}, []);

  return (
    <div className="h-full">
      <div className="flex items-center bg-background px-4 h-12 border-b">
        <h2 className="font-semibold">Providers</h2>
      </div>
      <div className="h-full overflow-y-auto"></div>
    </div>
  );
}
