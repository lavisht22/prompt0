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

import { useCallback, useState } from "react";
import ProviderIcon from "components/provider-icon";
import useProvidersStore, { Provider } from "stores/providers";
import { Json } from "supabase/types";

import OpenAIForm, { OpenAIOptions } from "./openai-form";

export default function ProviderModal() {
  const { activeProvider, setActiveProvider } = useProvidersStore();

  const [provider, setProviders] = useState<Provider | null>();

  const setOptions = useCallback(
    (options: unknown) => {
      if (!activeProvider) return;

      setActiveProvider({ ...activeProvider, options: options as Json });
    },
    [activeProvider, setActiveProvider]
  );

  const save = useCallback(() => {
    if (!activeProvider) return;

    if (activeProvider.id === "new") {
      // TODO: Create new provider
    } else {
      // Determine if the api key has changed
    }
  }, []);

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
            <SelectItem
              key="openai"
              value="openai"
              startContent={<ProviderIcon type="openai" />}
            >
              OpenAI
            </SelectItem>
            <SelectItem
              key="anthropic"
              value="anthropic"
              startContent={<ProviderIcon type="anthropic" />}
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
