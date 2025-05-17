import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { LuBox, LuCircleDashed, LuPlus } from "react-icons/lu";
import useProjectsStore from "stores/projects";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import supabase from "utils/supabase";
import useWorkspacesStore from "stores/workspaces";

export default function ProjectSelector({
  promptId,
  value,
  onValueChange,
}: {
  promptId: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
}) {
  const { projects, setProjects } = useProjectsStore();
  const { activeWorkspace } = useWorkspacesStore();
  const { isOpen, onOpenChange } = useDisclosure();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const updateProject = useCallback(
    async (projectId: string | null) => {
      try {
        setUpdating(true);

        const { error } = await supabase
          .from("prompts")
          .update({
            project_id: projectId,
          })
          .eq("id", promptId);

        if (error) {
          throw error;
        }

        onValueChange(projectId);
      } catch {
        toast.error("Oops! Something went wrong. Unable to update project.");
      } finally {
        setUpdating(false);
      }
    },
    [onValueChange, promptId]
  );

  const createProject = useCallback(async () => {
    try {
      if (!activeWorkspace) {
        throw new Error("No active workspace.");
      }

      setCreating(true);

      const { data, error } = await supabase
        .from("projects")
        .insert({
          workspace_id: activeWorkspace.id,
          name,
          description,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProjects([...projects, data]);
      onOpenChange();
      setName("");
      setDescription("");

      await updateProject(data.id);
    } catch {
      toast.error("Oops! Something went wrong. Unable to create project.");
    } finally {
      setCreating(false);
    }
  }, [
    activeWorkspace,
    name,
    description,
    setProjects,
    projects,
    onOpenChange,
    updateProject,
  ]);

  return (
    <>
      <Dropdown isDisabled={updating}>
        <DropdownTrigger>
          <Button
            startContent={<LuBox />}
            size="sm"
            variant="flat"
            className="text-xs font-medium"
          >
            {value ? (
              <span className="text-xs">
                {projects.find((p) => p.id === value)?.name}
              </span>
            ) : (
              <span className="text-xs">Add to project</span>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownSection showDivider>
            <DropdownItem
              key="no-project"
              onPress={() => updateProject(null)}
              startContent={<LuCircleDashed />}
            >
              No project
            </DropdownItem>
            <>
              {projects.map((project) => (
                <DropdownItem
                  key={project.id}
                  onPress={() => updateProject(project.id)}
                  startContent={<LuBox className="text-default-500" />}
                >
                  {project.name}
                </DropdownItem>
              ))}
            </>
          </DropdownSection>

          <DropdownItem
            key="new"
            startContent={<LuPlus />}
            onPress={onOpenChange}
          >
            Create new project
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Create project</ModalHeader>
          <ModalBody>
            <Input label="Project name" value={name} onValueChange={setName} />
            <Textarea
              label="Project description"
              value={description}
              onValueChange={setDescription}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onOpenChange}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={createProject}
              isLoading={creating}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
