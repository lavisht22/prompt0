import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { z } from "zod";
import supabase from "../../../utils/supabase";
import toast from "react-hot-toast";

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormValues = z.infer<typeof FormSchema>;

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signup = useCallback(async ({ name, email, password }: FormValues) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col w-full max-w-sm space-y-8">
      <div>
        <h3 className="text-3xl font-medium">Get started</h3>
        <h2>Create a new account</h2>
      </div>
      {success ? (
        <div className="space-y-8">
          <p>
            We've sent you an email to verify your account. Please check your
            inbox and click the link to activate your account.
          </p>
        </div>
      ) : (
        <>
          <form className="space-y-4" onSubmit={handleSubmit(signup)}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Name"
                  placeholder="John Doe"
                  autoComplete="name"
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  {...field}
                />
              )}
            />
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
              Sign Up
            </Button>
          </form>
          <p className="text-sm text-center">
            Have an account?{" "}
            <Link className="underline" to="/sign-in">
              Sign In Now
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
