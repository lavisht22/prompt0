import SplashScreen from "components/splash-screen";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useWorkspacesStore from "stores/workspaces";

export default function WelcomePage() {
  const navigate = useNavigate();

  const { workspaces, setActiveWorkspace, workspacesLoading } =
    useWorkspacesStore();

  useEffect(() => {
    if (workspaces.length > 0) {
      navigate(`/${workspaces[0].slug}`, {
        replace: true,
      });
    }
  }, [navigate, setActiveWorkspace, workspaces]);

  if (workspacesLoading) {
    return <SplashScreen loading />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      Welcome
    </div>
  );
}
