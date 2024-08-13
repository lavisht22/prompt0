import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { Controller, useForm } from "react-hook-form";
import { LuSave } from "react-icons/lu";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().min(2, "Name is too short."),
});

type FormValues = z.infer<typeof FormSchema>;

export default function PromptDetailsPage() {
  const { handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <div className="h-full">
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
                    inputWrapper: "bg-background",
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
        <div className="flex bg-red-300">Tests</div>
      </div>
    </form>
  );
}
