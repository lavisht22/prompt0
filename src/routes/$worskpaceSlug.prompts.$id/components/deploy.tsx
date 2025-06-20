import {
  Button,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { Version } from "../route";
import {
  useCallback,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import toast from "react-hot-toast";
import supabase from "utils/supabase";
import { LuCheckCircle, LuRocket, LuAlertCircle } from "react-icons/lu";

export default function Deploy({
  isDirty,
  activeVersionId,
  versions,
  setVersions,
}: {
  isDirty: boolean;
  activeVersionId: string | null;
  versions: Version[];
  setVersions: Dispatch<SetStateAction<Version[]>>;
}) {
  const { isOpen, onOpenChange, onClose } = useDisclosure();

  const [loading, setLoading] = useState(false);

  const activeVersion = useMemo(() => {
    return versions.find((v) => v.id === activeVersionId) || null;
  }, [activeVersionId, versions]);

  const deploy = useCallback(async () => {
    try {
      if (!activeVersion) {
        return;
      }

      setLoading(true);

      // Unpublish all other versions of this prompt
      await supabase
        .from("versions")
        .update({ published_at: null })
        .eq("prompt_id", activeVersion.prompt_id)
        .throwOnError();

      // Deploy the current version
      await supabase
        .from("versions")
        .update({ published_at: new Date().toISOString() })
        .eq("id", activeVersion.id)
        .throwOnError();

      // Update versions
      setVersions((prev) =>
        prev.map((v) => ({
          ...v,
          published_at:
            v.id === activeVersion.id ? new Date().toISOString() : null,
        }))
      );

      onClose();
    } catch {
      toast.error("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [activeVersion, setVersions, onClose]);

  return (
    <Popover
      placement="bottom-end"
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger>
        <Button size="sm" color="primary" startContent={<LuRocket />}>
          Deploy
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {isDirty ? (
          <div className="flex flex-col p-4 max-w-96 gap-y-4">
            <div className="flex">
              <LuAlertCircle className="w-5 h-5 text-danger-500 mr-2" />
              <p className="flex-1">
                Please run your prompt once before deploy.
              </p>
            </div>
          </div>
        ) : activeVersion?.published_at ? (
          <div className="flex flex-col p-4 max-w-96 gap-y-4">
            <div className="flex">
              <LuCheckCircle className="w-5 h-5 text-success-500 mr-2" />
              <p className="flex-1">This version is already deployed.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col p-4 max-w-96 gap-y-4">
            <p>
              Deploying this version will replace any previously deployed
              version of this prompt.
            </p>
            <Button
              color="primary"
              startContent={<LuRocket />}
              onPress={deploy}
              isLoading={loading}
            >
              Deploy
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
