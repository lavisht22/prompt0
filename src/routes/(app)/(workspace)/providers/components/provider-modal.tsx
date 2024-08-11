import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { SiAnthropic, SiOpenai } from "react-icons/si";

import useProvidersStore from "../../../../../stores/providers";
import { useCallback } from "react";
import { Json } from "../../../../../../supabase/types";
import OpenAIForm, { OpenAIOptions } from "./openai-form";

export default function ProviderModal() {
  const { activeProvider, setActiveProvider } = useProvidersStore();

  const setOptions = useCallback(
    (options: unknown) => {
      if (!activeProvider) return;

      setActiveProvider({ ...activeProvider, options: options as Json });
    },
    [activeProvider, setActiveProvider]
  );

  if (!activeProvider) return null;

  return (
    <Modal
      isOpen={activeProvider !== null}
      onOpenChange={() => setActiveProvider(null)}
    >
      <ModalContent>
        <ModalHeader>
          {activeProvider.id === "new" ? "Add provider" : "Update provider"}
        </ModalHeader>
        <ModalBody>
          <Input
            variant="bordered"
            label="Name"
            value={activeProvider.name}
            onValueChange={(name) =>
              setActiveProvider({ ...activeProvider, name })
            }
          />
          <Select
            variant="bordered"
            label="Type"
            disallowEmptySelection
            selectedKeys={new Set([activeProvider.type])}
            onSelectionChange={(keys) => {
              const arr = Array.from(keys) as string[];

              setActiveProvider({
                ...activeProvider,
                type: arr[0],
              });
            }}
          >
            <SelectItem key="openai" value="openai" startContent={<SiOpenai />}>
              OpenAI
            </SelectItem>
            <SelectItem
              key="anthropic"
              value="anthropic"
              startContent={<SiAnthropic />}
            >
              Anthropic
            </SelectItem>
          </Select>
          {activeProvider.type === "openai" && (
            <OpenAIForm
              options={activeProvider.options as OpenAIOptions}
              setOptions={setOptions}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={() => setActiveProvider(null)}>
            Cancel
          </Button>
          <Button color="primary">Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
