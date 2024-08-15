import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { LuPlus, LuSave } from "react-icons/lu";
import { z } from "zod";
import SystemMessage, {
  SystemMessageSchema,
} from "./components/system-message";
import UserMessage, { UserMessageSchema } from "./components/user-message";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "utils/supabase";
import { Database } from "supabase/types";
import toast from "react-hot-toast";
import { useAuth } from "contexts/auth-context";
import FullSpinner from "components/full-spinner";

type Version = Database["public"]["Tables"]["versions"]["Row"];

const MessageSchema = z.union([SystemMessageSchema, UserMessageSchema]);

const FormSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  messages: z.array(MessageSchema),
});

type FormValues = z.infer<typeof FormSchema>;

export default function PromptDetailsPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);

  const { promptId } = useParams<{ promptId: string }>();
  const { handleSubmit, control, reset } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      messages: [
        {
          role: "system",
          content: "",
        },
      ],
    },
  });

  const {
    fields: messages,
    append: addMessage,
    remove: removeMessage,
  } = useFieldArray({
    name: "messages",
    control,
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (!promptId) {
          return;
        }

        if (promptId === "create") {
          return;
        }

        setLoading(true);

        const { data: prompt, error: promptReadError } = await supabase
          .from("prompts")
          .select("*")
          .eq("id", promptId)
          .single();

        if (promptReadError) {
          throw promptReadError;
        }

        const { data: versions, error: versionsReadError } = await supabase
          .from("versions")
          .select("*")
          .eq("prompt_id", promptId)
          .order("number", { ascending: false });

        if (versionsReadError) {
          throw versionsReadError;
        }

        setVersions(versions);

        const latestVersion =
          versions.length > 0
            ? (versions[0].data as {
                messages?: FormValues["messages"];
              })
            : {};

        const payload = {
          name: prompt.name,
          messages: [
            {
              role: "system" as const,
              content: "",
            },
          ],
          ...latestVersion,
        };

        reset(payload);

        setLoading(false);
      } catch {
        toast.error("Oops! Something went wrong.");
      }
    };

    init();
  }, [promptId, reset]);

  const save = useCallback(
    async (values: FormValues) => {
      try {
        if (!promptId || !session) {
          return;
        }

        setSaving(true);

        if (promptId === "create") {
          return;
        }

        const number = versions.length > 0 ? versions[0].number + 1 : 1;

        await supabase
          .from("prompts")
          .update({
            name: values.name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", promptId);

        const { data, error } = await supabase
          .from("versions")
          .insert({
            prompt_id: promptId,
            number,
            data: {
              messages: values.messages,
            },
            user_id: session?.user.id,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        setVersions((prev) => [data, ...prev]);

        toast.success("Saved successfully.");
      } catch {
        toast.error("Oops! Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [promptId, session, versions]
  );

  if (loading) {
    return <FullSpinner />;
  }

  return (
    <div className="h-full">
      <form className="h-full flex flex-col" onSubmit={handleSubmit(save)}>
        <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
          <div className="flex items-center gap-x-2">
            <h2 className="font-medium">Prompts</h2>
            <p className="-mr-2 font-medium">{" > "}</p>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  className="w-56"
                  size="sm"
                  classNames={{
                    inputWrapper: "bg-background shadow-none",
                    input: "font-medium text-base",
                  }}
                  placeholder="Hello world prompt"
                  isInvalid={fieldState.invalid}
                  {...field}
                />
              )}
            />
          </div>

          <Button
            isLoading={saving}
            type="submit"
            size="sm"
            color="primary"
            startContent={<LuSave />}
          >
            Save
          </Button>
        </div>
        <div className="flex-1 flex overflow-y-hidden">
          <div className="flex-1 h-full overflow-y-auto">
            {messages.map((field, index) => {
              if (field.role === "system") {
                return (
                  <Controller
                    key={field.id}
                    name={`messages.${index}`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <SystemMessage
                        value={
                          field.value as z.infer<typeof SystemMessageSchema>
                        }
                        onValueChange={field.onChange}
                        isInvalid={fieldState.invalid}
                      />
                    )}
                  />
                );
              }

              if (field.role === "user") {
                return (
                  <Controller
                    key={field.id}
                    name={`messages.${index}`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <UserMessage
                        value={field.value as z.infer<typeof UserMessageSchema>}
                        onValueChange={field.onChange}
                        isInvalid={fieldState.invalid}
                        onRemove={() => removeMessage(index)}
                      />
                    )}
                  />
                );
              }

              return null;
            })}
            <div className="p-3">
              <Button
                color="primary"
                size="sm"
                startContent={<LuPlus />}
                onPress={() =>
                  addMessage({
                    role: "user",
                    content: [{ type: "text", text: "" }],
                  })
                }
              >
                User
              </Button>
            </div>
          </div>
          <div className="bg-green-300 flex-1">2</div>
          <div className="bg-yellow-200 w-56">3</div>
        </div>
      </form>
    </div>
  );
}
