"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "../utils/supabase";
import { useNavigate, useNavigation } from "react-router-dom";
import SplashScreen from "../components/splash-screen";

interface AuthContextT {
  user: User | null;
  userLoading: boolean;
}

const AuthContext = createContext<AuthContextT>({
  user: null,
  userLoading: true,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setUserLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_OUT") {
            setUser(null);
            navigate(
              `/login?returnTo=${encodeURIComponent(
                navigation.location?.pathname || ""
              )}`
            );
          }
        });

        setUser(user);
      } catch (error) {
        console.error(error);
        setError("Could not load the page at the moment.");
      } finally {
        setUserLoading(false);
      }
    };

    init();
  }, [navigate, navigation.location?.pathname, setUser]);

  if (error) {
    return <SplashScreen loading={false} error={error} />;
  }

  return (
    <AuthContext.Provider value={{ user, userLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
