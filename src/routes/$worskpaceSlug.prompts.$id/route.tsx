import { useEffect, useState } from "react";
import Name from "./components/name";
import { useParams } from "react-router-dom";
import { Tabs, Tab, Tooltip } from "@heroui/react";
import useWorkspacesStore from "stores/workspaces";
import supabase from "utils/supabase";
import { Database } from "supabase/functions/types";
import toast from "react-hot-toast";
import FullSpinner from "components/full-spinner";
import Prompt from "./prompt";
import Evaluate from "./evaluate";
import Menu from "./components/menu";
import History from "./components/history";
import ProjectSelector from "components/project-selector";

export type Version = Database["public"]["Tables"]["versions"]["Row"];

export default function PromptDetailsPage() {
  const { promptId } = useParams<{ promptId: string }>();
  const { activeWorkspace } = useWorkspacesStore();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("prompt");
  const [versions, setVersions] = useState<Version[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!promptId || !activeWorkspace) {
          return;
        }

        if (promptId === "create") {
          setLoading(false);
          return;
        }

        setLoading(true);

        const { data: prompt, error: promptReadError } = await supabase
          .from("prompts")
          .select("*")
          .eq("id", promptId)
          .single();

        if (promptReadError) {
          throw promptReadError;
        }

        setName(prompt.name);
        setProjectId(prompt.project_id);

        const { data: versions, error: versionsReadError } = await supabase
          .from("versions")
          .select("*")
          .eq("prompt_id", promptId)
          .order("number", { ascending: false });

        if (versionsReadError) {
          throw versionsReadError;
        }

        setVersions(versions);
        setActiveVersionId(versions[0].id);

        setLoading(false);
      } catch {
        toast.error("Oops! Something went wrong.");
      }
    };

    init();
  }, [activeWorkspace, promptId]);

  if (loading) {
    return <FullSpinner />;
  }

  if (!promptId) {
    // TODO: Redirect to the prompts page
    return null;
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center bg-background px-3 h-12 border-b relative">
        <div className="flex items-center gap-1">
          <Name value={name} onValueChange={setName} promptId={promptId} />
          <ProjectSelector
            promptId={promptId}
            value={projectId}
            onValueChange={setProjectId}
          />

          <History
            versions={versions}
            activeVersionId={activeVersionId}
            setActiveVersionId={setActiveVersionId}
          />

          {dirty && (
            <div className="bg-warning-200 text-default-600 rounded-lg px-2 py-1 flex justify-center items-center">
              <span className="text-xs font-bold">UNSAVED</span>
            </div>
          )}

          <Menu promptId={promptId} />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Tooltip
            size="sm"
            content="Save your prompt to enable evaluations."
            placement="right"
            isDisabled={!dirty}
          >
            <Tabs
              size="sm"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
            >
              <Tab key="prompt" title="Prompt" />
              <Tab key="evaluate" title="Evaluate" isDisabled={dirty} />
            </Tabs>
          </Tooltip>
        </div>
      </div>
      {activeTab === "prompt" && (
        <Prompt
          name={name}
          setName={setName}
          versions={versions}
          activeVersionId={activeVersionId}
          setVersions={setVersions}
          setActiveVersionId={setActiveVersionId}
          setDirty={setDirty}
        />
      )}
      {activeTab === "evaluate" && (
        <Evaluate activeVersionId={activeVersionId} versions={versions} />
      )}
    </div>
  );
}
