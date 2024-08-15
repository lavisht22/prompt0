import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { Controller, useForm } from "react-hook-form";
import { LuSave } from "react-icons/lu";
import { z } from "zod";
import System from "./components/system";
import UserMessage from "./components/user-message";

const MessageSchema = z.object({
  role: z.enum(["system", "assistant"]),
  content: z.string(),
});

const FormSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  system: z.string(),
  messages: z.array(MessageSchema),
});

type FormValues = z.infer<typeof FormSchema>;

export default function PromptDetailsPage() {
  const { handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      system: "",
    },
  });

  return (
    <div className="h-full">
      <form className="h-full flex flex-col" onSubmit={handleSubmit(() => {})}>
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
            <Controller
              name="system"
              control={control}
              render={({ field, fieldState }) => (
                <System
                  value={field.value}
                  onValueChange={field.onChange}
                  isInvalid={fieldState.invalid}
                />
              )}
            />

            <UserMessage />
            <UserMessage />
          </div>
          <div className="bg-green-300 flex-1">2</div>
          <div className="bg-yellow-200 w-56">3</div>
        </div>
      </form>
    </div>
  );
}
