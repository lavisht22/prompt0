import { Button, Input } from "@nextui-org/react";

export default function SignIn() {
  return (
    <div className="flex flex-col w-full max-w-lg space-y-8">
      <div>
        <h3 className="text-3xl">Welcome back</h3>
        <h2>Sign in to your account</h2>
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
      <Button color="primary">Sign In</Button>
    </div>
  );
}
