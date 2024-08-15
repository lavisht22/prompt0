import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { LuPlus, LuSave } from "react-icons/lu";
import { z } from "zod";
import SystemMessage, {
  SystemMessageSchema,
} from "./components/system-message";
import UserMessage, { UserMessageSchema } from "./components/user-message";

const MessageSchema = z.union([SystemMessageSchema, UserMessageSchema]);

const FormSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  messages: z.array(MessageSchema),
});

type FormValues = z.infer<typeof FormSchema>;

export default function PromptDetailsPage() {
  const { handleSubmit, control } = useForm<FormValues>({
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

  return (
    <div className="h-full">
      <form
        className="h-full flex flex-col"
        onSubmit={handleSubmit((values) => {
          console.log("VALYES", values);
        })}
      >
        <div className="flex justify-between items-center bg-background px-6 h-12 border-b">
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
