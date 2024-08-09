import { Button, Input } from "@nextui-org/react";
import { Link } from "react-router-dom";

export default function SignUpPage() {
  return (
    <div className="flex flex-col w-full max-w-lg space-y-8">
      <div>
        <h3 className="text-3xl font-medium">Get started</h3>
        <h2>Create a new account</h2>
      </div>
      <div className="space-y-12">
        <Input
          variant="bordered"
          label="Email"
          labelPlacement="outside"
          placeholder="you@example.com"
        />
        <Input
          variant="bordered"
          label="Password"
          labelPlacement="outside"
          type="password"
          placeholder="••••••••••••••"
        />
      </div>
      <Button color="primary">Sign Up</Button>
      <p className="text-sm text-center">
        Have an account?{" "}
        <Link className="underline" to="/sign-in">
          Sign In Now
        </Link>
      </p>
    </div>
  );
}
