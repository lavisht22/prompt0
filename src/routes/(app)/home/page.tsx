import { useAuth } from "../../../contexts/auth-context";

export default function HomePage() {
  const { session } = useAuth();

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-green-50">
      {session?.user?.email}
    </div>
  );
}
