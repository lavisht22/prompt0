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

import { useCallback, useEffect, useState } from "react";
import ProviderIcon from "components/provider-icon";
import useProvidersStore, { Provider } from "stores/providers";

import OpenAIForm from "./openai-form";
import toast from "react-hot-toast";
import supabase from "utils/supabase";

// Functions to mask the key with leving first 4 and last 4 characters
function maskKey(key: string) {
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
}

export default function ProviderModal() {
  const { activeProvider, setActiveProvider, setProviders, providers } =
    useProvidersStore();

  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<Provider | null>();

  useEffect(() => {
    setProvider(activeProvider);
  }, [activeProvider]);

  const setOptions = useCallback(
    (options: Provider["options"]) => {
      if (!provider) return;

      setProvider({ ...provider, options });
    },
    [provider]
  );

  const save = useCallback(async () => {
    try {
      if (!provider) return;

      setLoading(true);
      if (provider.id === "new") {
        // TODO: Create new provider
      } else {
        console.log("OPTIONS", provider.options);

        if (provider.options["key"]) {
          const key = provider.options["key"];
          provider.options["key"] = maskKey(key);

          if (key !== activeProvider?.options?.key) {
            await supabase
              .from("keys")
              .update({
                value: key,
                updated_at: new Date().toISOString(),
              })
              .eq("provider_id", provider.id)
              .throwOnError();
          }
        }

        await supabase
          .from("providers")
          .update(provider)
          .eq("id", provider.id)
          .throwOnError();

        setProviders(
          providers.map((p) => (p.id === provider.id ? provider : p))
        );
        toast.success("Provider saved");
        setActiveProvider(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [
    activeProvider?.options?.key,
    provider,
    providers,
    setActiveProvider,
    setProviders,
  ]);

  if (!provider) return null;

  return (
    <Modal
      isOpen={provider !== null}
      onOpenChange={() => setActiveProvider(null)}
    >
      <ModalContent>
        <ModalHeader>
          {provider.id === "new" ? "Add provider" : "Update provider"}
        </ModalHeader>
        <ModalBody>
          <Input
            variant="bordered"
            label="Name"
            value={provider.name}
            onValueChange={(name) => setActiveProvider({ ...provider, name })}
          />
          <Select
            variant="bordered"
            label="Type"
            disallowEmptySelection
            selectedKeys={new Set([provider.type])}
            onSelectionChange={(keys) => {
              const arr = Array.from(keys) as string[];

              setActiveProvider({
                ...provider,
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
          {provider.type === "openai" && (
            <OpenAIForm options={provider.options} setOptions={setOptions} />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={() => setActiveProvider(null)}>
            Cancel
          </Button>
          <Button color="primary" onPress={save} isLoading={loading}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
