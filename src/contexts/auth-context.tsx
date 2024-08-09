"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import supabase from "../utils/supabase";
import { useNavigate, useNavigation } from "react-router-dom";
import SplashScreen from "../components/splash-screen";

interface AuthContextT {
  session: Session | null;
}

const AuthContext = createContext<AuthContextT>({
  session: null,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate(
            `/sign-in?returnTo=${encodeURIComponent(
              navigation.location?.pathname || ""
            )}`
          );

          return;
        }

        setSession(session);
      } catch {
        setError("Could not load the page at the moment.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate, navigation.location?.pathname]);

  if (loading || error) {
    return <SplashScreen loading={loading} error={error} />;
  }

  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
