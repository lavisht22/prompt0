"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import supabase from "../utils/supabase";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import SplashScreen from "../components/splash-screen";

interface AuthContextT {
  user: User | null;
  userLoading: boolean;
  updateUserMetadata: (metadata: Record<string, string>) => Promise<void>;
}

const AuthContext = createContext<AuthContextT>({
  user: null,
  userLoading: true,
  updateUserMetadata: () => Promise.resolve(),
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

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

        // Check if the current URL is root, then redirect to a workspace
        if (location.pathname === "/") {
          const lastWorkspace = user?.user_metadata.last_workspace as
            | string
            | null
            | undefined;

          if (lastWorkspace) {
            navigate(`/${lastWorkspace}`);
            return;
          }

          const { data, error } = await supabase
            .from("workspaces")
            .select("id, slug");

          if (error) {
            throw error;
          }

          if (data.length > 0) {
            navigate(`/${data[0].slug}`);
          }
        }
      } catch {
        setError("Oops! Something went wrong. Please try again later.");
      } finally {
        setUserLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, setUser]);

  const userMetadata = useRef<Record<string, unknown>>({});

  useEffect(() => {
    if (!user) return;

    userMetadata.current = user.user_metadata;
  }, [user]);

  const updateUserMetadata = useCallback(
    async (metadata: Record<string, string>) => {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...userMetadata.current,
          ...metadata,
        },
      });

      if (error) {
        throw error;
      }

      setUser(data.user);
    },
    []
  );

  if (error) {
    return <SplashScreen loading={false} error={error} />;
  }

  return (
    <AuthContext.Provider value={{ user, userLoading, updateUserMetadata }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
