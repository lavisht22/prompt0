import { Progress } from "@heroui/react";
import Logo from "./logo";
import { Card, CardBody } from "@heroui/react";
import { LuAlertTriangle } from "react-icons/lu";

type Props = {
  loading?: boolean;
  error?: string | null;
};

export default function SplashScreen({ loading, error }: Props) {
  return (
    <div className="h-screen w-screen p-6 flex flex-col justify-center items-center space-y-8">
      <Logo />
      {loading && (
        <Progress
          size="sm"
          isIndeterminate
          aria-label="Loading..."
          className="max-w-[150px]"
        />
      )}

      {error && (
        <Card>
          <CardBody className="p-6">
            <div className="flex space-x-2 items-center text-lg font-medium text-danger">
              <LuAlertTriangle />
              <h3>Error</h3>
              <p>{error}</p>
            </div>
            <p>{error}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
