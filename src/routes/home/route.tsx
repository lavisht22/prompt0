import { useAuth } from "contexts/auth-context";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-green-50">
      <p>
        {user?.email}
        <br />
        Website content will come here soon
      </p>
      <Link to="/login">Login</Link>
    </div>
  );
}
