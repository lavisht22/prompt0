import { Button } from "@nextui-org/react";
import { Controller, useFieldArray, Control } from "react-hook-form";
import { LuPlus, LuTrash } from "react-icons/lu";
import { FormValues } from "../prompt";

interface ToolsProps {
  control: Control<FormValues>;
}

export default function Tools({ control }: ToolsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tools",
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tools</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <Controller
            name={`tools.${index}.function.name`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="Function name"
                className="flex-grow p-2 border rounded"
              />
            )}
          />
          <Button
            size="sm"
            color="danger"
            isIconOnly
            onPress={() => remove(index)}
          >
            <LuTrash className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="light"
        startContent={<LuPlus />}
        onPress={() =>
          append({
            type: "function",
            function: { name: "", parameters: {}, strict: false },
          })
        }
      >
        Add Tool
      </Button>
    </div>
  );
}
