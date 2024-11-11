import { Button } from "@nextui-org/react";
import { FaEnvelope, FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-fade">
      <h1 className="text-xl">Login to prompt0</h1>
      <div className="flex flex-col items-center gap-3 w-full">
        <Button
          fullWidth
          className="max-w-sm"
          color="primary"
          variant="flat"
          size="lg"
          startContent={<FaEnvelope />}
          onPress={() => navigate("/login/email")}
        >
          Continue with email
        </Button>
        <Button
          isDisabled
          fullWidth
          className="max-w-sm"
          color="primary"
          variant="flat"
          size="lg"
          startContent={<FaGoogle />}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
