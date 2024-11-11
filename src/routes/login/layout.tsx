import { useAuth } from "contexts/auth-context";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function LoginLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/welcome");
    }
  }, [navigate, user]);

  return (
    <div className="h-screen w-screen relative">
      <div className="absolute top-[30%] sm:top-[40%] left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-6 w-full max-w-lg p-4">
        <span className="block text-5xl font-semibold font-mono text-primary text-left mb-4">
          0
        </span>
        <Outlet />
      </div>
    </div>
  );
}
