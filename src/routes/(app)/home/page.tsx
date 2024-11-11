import { useAuth } from "../../../contexts/auth-context";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-green-50">
      {user?.email}
      <br />
      Website content will come here soon
    </div>
  );
}
