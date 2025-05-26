import {
  Button,
  Textarea,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/react";
import { LuPlay } from "react-icons/lu";
import { FormValues } from "../prompt";
import { useEffect, useState } from "react";
import { extractVaraiblesFromMessages } from "utils/variables";

export default function VariablesDialog({
  isOpen,
  onOpenChange,
  values,
  setValues,
  getFormValues,
  onRun,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  values: Map<string, string>;
  setValues: (values: Map<string, string>) => void;
  getFormValues: () => FormValues;
  onRun: () => void;
}) {
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    setVariables(extractVaraiblesFromMessages(getFormValues().messages));
  }, [getFormValues, isOpen]);

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      backdrop="blur"
    >
      <DrawerContent>
        <DrawerHeader>Variables</DrawerHeader>
        <DrawerBody className="flex flex-col gap-4">
          {variables.map((variable) => {
            const value = values.get(variable);

            return (
              <div key={variable}>
                <Textarea
                  isInvalid={value === undefined || value.length === 0}
                  label={`{{${variable}}}`}
                  size="sm"
                  labelPlacement="outside"
                  minRows={1}
                  maxRows={5}
                  value={value}
                  onChange={(e) => {
                    setValues(new Map(values.set(variable, e.target.value)));
                  }}
                />
              </div>
            );
          })}
        </DrawerBody>
        <DrawerFooter>
          <Button
            isDisabled={variables.some((variable) => {
              const value = values.get(variable);
              return value === undefined || value.length === 0;
            })}
            fullWidth
            color="primary"
            startContent={<LuPlay />}
            onPress={() => {
              onOpenChange(false);
              onRun();
            }}
          >
            Run
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
