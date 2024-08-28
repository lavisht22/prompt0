"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "../utils/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import SplashScreen from "../components/splash-screen";

interface AuthContextT {
  user: User | null;
}

const AuthContext = createContext<AuthContextT>({
  user: null,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate(`/sign-in?returnTo=${encodeURIComponent(pathname)}`);
          return;
        }

        supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_OUT") {
            setUser(null);
            navigate(`/sign-in?returnTo=${encodeURIComponent(pathname)}`);
          }
        });

        setUser(user);
      } catch (error) {
        console.error(error);
        setError("Could not load the page at the moment.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate, pathname, setUser]);

  if (loading || error) {
    return <SplashScreen loading={loading} error={error} />;
  }

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
