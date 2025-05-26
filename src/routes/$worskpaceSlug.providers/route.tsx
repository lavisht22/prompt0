import { useCallback, useEffect, useState } from "react";
import supabase from "utils/supabase";
import useWorkspacesStore from "stores/workspaces";
import toast from "react-hot-toast";
import { Button, Input } from "@heroui/react";
import { LuPlus, LuSearch } from "react-icons/lu";
import ProviderIcon from "components/provider-icon";
import { Link, useNavigate } from "react-router-dom";
import { Database } from "supabase/functions/types";
import EmptyList from "components/empty-list";
import { formatDistanceToNow } from "date-fns";

type Provider = Omit<
  Database["public"]["Tables"]["providers"]["Row"],
  "options"
> & {
  options: { [key: string]: string };
};

export default function ProvidersPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspacesStore();

  const [providers, setProviders] = useState<Provider[]>([]);

  const load = useCallback(async () => {
    try {
      if (!activeWorkspace) {
        return;
      }

      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("workspace_id", activeWorkspace.id)
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProviders(
        data.map((provider) => ({
          ...provider,
          options: provider.options as Provider["options"],
        }))
      );
    } catch {
      toast.error("Oops! Something went wrong.");
    }
  }, [activeWorkspace, setProviders]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async () => {
    navigate(`/${activeWorkspace?.slug}/providers/add`);
  }, [activeWorkspace, navigate]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="font-medium">Providers</h2>
        </div>
        <Button
          size="sm"
          color="primary"
          startContent={<LuPlus />}
          onPress={add}
        >
          Add
        </Button>
      </div>
      {providers.length === 0 ? (
        <EmptyList
          title="No providers yet"
          description="Once you add an AI provider, it will appear here."
          buttonText="Add Provider"
          onButtonClick={add}
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Input
            variant="flat"
            className="bg-background"
            classNames={{
              inputWrapper: "bg-background border-b px-4",
            }}
            radius="none"
            aria-label="Search"
            startContent={<LuSearch />}
            placeholder="Search"
          />

          {providers.map((provider) => (
            <Link
              to={`/${activeWorkspace?.slug}/providers/${provider.id}`}
              key={provider.id}
              className="w-full flex flex-row justify-between items-center px-4 py-4 cursor-default hover:bg-default-100"
            >
              <div className="flex items-center space-x-3">
                <ProviderIcon type={provider.type} className="w-6 h-6" />
                <h4 className="text-sm">{provider.name}</h4>
              </div>
              <div>
                <span className="block text-xs text-default-500">
                  {formatDistanceToNow(new Date(provider.updated_at))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
