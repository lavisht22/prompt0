import SplashScreen from "components/splash-screen";
import { useEffect, useState } from "react";
import supabase from "utils/supabase";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const lastActiveWorkspace = localStorage.getItem("lastActiveWorkspace");

        if (lastActiveWorkspace) {
          navigate(`/${lastActiveWorkspace}/prompts`);
        } else {
          const { data, error } = await supabase.from("workspaces").select("*");

          if (error) {
            throw error;
          }

          if (data.length === 0) {
            throw new Error(
              "No workspaces found. Please create a new workspace."
            );
          }

          navigate(`/${data[0].slug}/prompts`);
        }
      } catch (error) {
        console.error(error);
        setError("Unable to load this page at the moment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  if (loading || error) {
    return <SplashScreen loading={loading} />;
  }
}
