import { useDisclosure, Button } from "@heroui/react";
import { ToolDialog } from "./tool-dialog";
import { LuPlus } from "react-icons/lu";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { FormValues } from "../prompt";
import { z } from "zod";
import Tool, { ToolSchema } from "./tool";
import { useEffect } from "react";

export default function Tools() {
  const { isOpen, onOpenChange, onOpen } = useDisclosure();

  const { control, setValue } = useFormContext<FormValues>();

  const {
    fields: tools,
    append: addTool,
    remove: removeTool,
  } = useFieldArray({
    name: "tools",
    control: control,
  });

  // Add this useWatch hook to listen for changes in the tools array
  const toolsWatch = useWatch({
    control: control,
    name: "tools",
  });

  // Add this useEffect to set tools to undefined when its length becomes 0
  useEffect(() => {
    if (toolsWatch && toolsWatch.length === 0) {
      setValue("tools", undefined);
    }
  }, [setValue, toolsWatch]);

  return (
    <>
      <ToolDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        value={{
          type: "function",
          function: {
            name: "function_name",
            description: "description of the function",
            strict: true,
            parameters: {
              type: "object",
              properties: {
                property_name: {
                  type: "string",
                  description: "description of this property",
                },
              },
              additionalProperties: false,
              required: [],
            },
          },
        }}
        onValueChange={(value) => addTool(value)}
      />
      {tools.map((_, index) => (
        <Controller
          key={index}
          name={`tools.${index}`}
          control={control}
          render={({ field, fieldState }) => (
            <Tool
              value={field.value as z.infer<typeof ToolSchema>}
              onValueChange={field.onChange}
              isInvalid={fieldState.invalid}
              onRemove={() => removeTool(index)}
            />
          )}
        />
      ))}

      <Button
        variant="flat"
        size="sm"
        startContent={<LuPlus />}
        onPress={onOpen}
      >
        Add Tool
      </Button>
    </>
  );
}
