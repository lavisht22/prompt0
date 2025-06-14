import { Button, Spinner } from "@heroui/react";
import { LuPlus } from "react-icons/lu";
import { LuInbox } from "react-icons/lu";

export default function EmptyList({
  loading,
  title,
  description,
  buttonText,
  onButtonClick,
}: {
  loading?: boolean;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center h-full overflow-hidden">
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center h-full overflow-hidden">
      <LuInbox className="text-6xl text-default-300 mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-default-500 mb-4">{description}</p>
      {buttonText && onButtonClick && (
        <div className="mt-2">
          <Button
            color="primary"
            startContent={<LuPlus />}
            onPress={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
}
