import { Button, Input } from "@nextui-org/react";

export default function SignIn() {
  return (
    <div className="h-screen grid grid-cols-12">
      <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex flex-col justify-center items-center px-8 border-r shadow-xl">
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
      </div>
      <div className="hidden sm:flex lg:col-span-6 xl:col-span-8 bg-content2"></div>
    </div>
  );
}
