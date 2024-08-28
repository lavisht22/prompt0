import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { z } from "zod";
import supabase from "../../../utils/supabase";
import toast from "react-hot-toast";

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormValues = z.infer<typeof FormSchema>;

export default function SignInPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signin = useCallback(
    async ({ email, password }: FormValues) => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        toast.success("Signed in successfully!");
        navigate("/");
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  return (
    <div className="flex flex-col w-full max-w-sm space-y-8">
      <div>
        <h3 className="text-3xl font-medium">Welcome back</h3>
        <h2>Sign in to your account</h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(signin)}>
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="Email"
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
              label="Password"
              type="password"
              placeholder="••••••••••••••"
              autoComplete="new-password"
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              {...field}
            />
          )}
        />
        <Button
          type="submit"
          color="primary"
          className="w-full"
          isLoading={loading}
        >
          Sign In
        </Button>
      </form>
      <p className="text-sm text-center">
        Don't have an account?{" "}
        <Link className="underline" to="/sign-up">
          Sign Up Now
        </Link>
      </p>
    </div>
  );
}
