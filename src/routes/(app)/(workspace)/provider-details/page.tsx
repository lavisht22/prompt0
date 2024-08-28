import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import FullSpinner from "components/full-spinner";
import { useAuth } from "contexts/auth-context";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import useWorkspacesStore from "stores/workspaces";
import supabase from "utils/supabase";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().min(1),
});

export type FormValues = z.infer<typeof FormSchema>;

const defaultValues: FormValues = {
  name: "",
};

export default function ProviderDetailsPage() {
  const { session } = useAuth();
  const { activeWorkspace } = useWorkspacesStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { providerId } = useParams<{ providerId: string }>();

  const { handleSubmit, control, reset } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (!providerId || !activeWorkspace) {
          return;
        }

        if (providerId === "add") {
          setLoading(false);
          return;
        }

        setLoading(true);

        const { data: provider, error: providerReadError } = await supabase
          .from("providers")
          .select("*")
          .eq("id", providerId)
          .single();

        if (providerReadError) {
          throw providerReadError;
        }

        reset(provider as unknown as FormValues);
        setLoading(false);
      } catch {
        toast.error("Oops! Something went wrong.");
      }
    };

    init();
  }, [activeWorkspace, providerId, reset]);

  const save = useCallback(
    async (values: FormValues) => {
      try {
        if (!providerId || !session || !activeWorkspace) {
          return;
        }

        if (providerId === "add") {
          const { data: newProvider, error: newProviderError } = await supabase
            .from("providers")
            .insert(values)
            .select()
            .single();

          if (newProviderError) {
            throw newProviderError;
          }

          navigate(`/${activeWorkspace.slug}/providers/${newProvider.id}`, {
            replace: true,
          });
        } else {
          const { error: updateError } = await supabase
            .from("providers")
            .update(values)
            .eq("id", providerId);

          if (updateError) {
            throw updateError;
          }

          reset(values);
        }

        setSaving(true);
      } catch {
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [activeWorkspace, navigate, providerId, reset, session]
  );

  if (loading) {
    return <FullSpinner />;
  }

  return (
    <div className="h-full">
      <form className="h-full flex flex-col" onSubmit={handleSubmit(save)}>
        <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
          <div className="flex items-center">
            <h2 className="font-medium">Providers</h2>
            <p className="font-medium ml-2">{">"}</p>
          </div>
          <div className="flex">
            <Button type="submit" size="sm" color="primary" isDisabled={saving}>
              Save
            </Button>
          </div>
        </div>
        <div className="flex-1 flex overflow-y-hidden justify-center items-center">
          <div className="max-w-xl w-full">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  fullWidth
                  label="Name"
                  value={field.value}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
