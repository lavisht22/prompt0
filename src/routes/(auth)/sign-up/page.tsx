import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { z } from "zod";
import supabase from "../../../utils/supabase";

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormValues = z.infer<typeof FormSchema>;

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(
    "This is a test error. Not a real life error!"
  );

  const { handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signup = useCallback(async ({ email, password }: FormValues) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        throw error;
      }
      console.log(data);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  return (
    <div className="flex flex-col w-full max-w-lg space-y-8">
      <div>
        <h3 className="text-3xl font-medium">Get started</h3>
        <h2>Create a new account</h2>
      </div>
      <form className="space-y-10" onSubmit={handleSubmit(signup)}>
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              variant="bordered"
              label="Email"
              labelPlacement="outside"
              placeholder="you@example.com"
              autoComplete="email"
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              {...field}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              variant="bordered"
              label="Password"
              labelPlacement="outside"
              type="password"
              placeholder="••••••••••••••"
              autoComplete="new-password"
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              {...field}
            />
          )}
        />
        <Button type="submit" color="primary" className="w-full">
          Sign Up
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>

      <p className="text-sm text-center">
        Have an account?{" "}
        <Link className="underline" to="/sign-in">
          Sign In Now
        </Link>
      </p>
    </div>
  );
}
