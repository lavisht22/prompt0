import { PropsWithChildren } from "react";
import AuthProvider from "../../contexts/auth-context";

export default function AppProviders({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
