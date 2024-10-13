import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { ToolSchema } from "./tool";
import { z } from "zod";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { LuChevronDown, LuTrash2 } from "react-icons/lu";

export function ToolDialog({
  isOpen,
  onOpenChange,
  value,
  onValueChange,
  onRemove,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: z.infer<typeof ToolSchema>;
  onValueChange: (value: z.infer<typeof ToolSchema>) => void;
  onRemove?: () => void;
}) {
  const [internalValue, setInternalValue] = useState("");

  useEffect(() => {
    setInternalValue(JSON.stringify(value, null, 2));
  }, [value, isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
      <ModalContent>
        <ModalHeader className="px-4">
          {!onRemove ? "Add" : "Edit"} Tool
        </ModalHeader>
        <ModalBody className="p-0">
          <div className="flex items-center justify-end px-4">
            <Dropdown size="sm">
              <DropdownTrigger>
                <Button
                  variant="light"
                  endContent={<LuChevronDown className="" />}
                >
                  Examples
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Examples">
                <DropdownItem
                  key="get_weather"
                  onPress={() =>
                    setInternalValue(
                      JSON.stringify(
                        {
                          type: "function",
                          function: {
                            name: "get_weather",
                            description: "Determine weather in my location",
                            strict: true,
                            parameters: {
                              type: "object",
                              properties: {
                                location: {
                                  type: "string",
                                  description:
                                    "The city and state e.g. San Francisco, CA",
                                },
                                unit: {
                                  type: "string",
                                  enum: ["c", "f"],
                                },
                              },
                              additionalProperties: false,
                              required: ["location", "unit"],
                            },
                          },
                        },
                        null,
                        2
                      )
                    )
                  }
                >
                  get_weather()
                </DropdownItem>
                <DropdownItem
                  key="get_stock_price"
                  onPress={() =>
                    setInternalValue(
                      JSON.stringify(
                        {
                          type: "function",
                          function: {
                            name: "get_stock_price",
                            description: "Get the current stock price",
                            strict: true,
                            parameters: {
                              type: "object",
                              properties: {
                                symbol: {
                                  type: "string",
                                  description: "The stock symbol",
                                },
                              },
                              additionalProperties: false,
                              required: ["symbol"],
                            },
                          },
                        },
                        null,
                        2
                      )
                    )
                  }
                >
                  get_stock_price()
                </DropdownItem>
                <DropdownItem
                  key="get_traffic"
                  onPress={() =>
                    setInternalValue(
                      JSON.stringify(
                        {
                          type: "function",
                          function: {
                            name: "get_traffic",
                            description:
                              "Gives current traffic conditions for a given area.",
                            parameters: {
                              type: "object",
                              properties: {
                                location: {
                                  type: "object",
                                  properties: {
                                    city: {
                                      type: "string",
                                      description: "Name of the city",
                                    },
                                    state: {
                                      type: "string",
                                      description:
                                        "Two-letter state abbreviation",
                                    },
                                  },
                                  required: ["city", "state"],
                                },
                              },
                              required: ["location"],
                            },
                          },
                        },
                        null,
                        2
                      )
                    )
                  }
                >
                  get_traffic()
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <Editor
            className="border-t"
            height="500px"
            value={internalValue}
            onChange={(value) => setInternalValue(value ?? "")}
            language="json"
            options={{
              minimap: { enabled: false },
              lineNumbers: "off",
              wordWrap: "on",
            }}
          />
        </ModalBody>

        <ModalFooter className="flex items-center justify-between">
          <div>
            {onRemove && (
              <Button
                color="danger"
                variant="flat"
                isIconOnly
                onPress={onRemove}
              >
                <LuTrash2 className="size-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="flat" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={() => {
                onValueChange(JSON.parse(internalValue));
                onOpenChange(false);
              }}
            >
              {onRemove ? "Update" : "Add"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
