import { useCallback, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import supabase from "utils/supabase";
import { Button, Input } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

const FormSchema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function LoginEmailPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { handleSubmit, control, watch } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  const email = watch("email");

  const login = useCallback(async ({ email }: FormValues) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/welcome`,
        },
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-6 w-full animate-fade">
        <h1 className="text-xl">Check your email</h1>
        <div className="text-center">
          <p>We've sent a temporary login link.</p>
          <p>
            Please check your inbox at{" "}
            <span className="font-semibold">{email}</span>
          </p>
        </div>
        <Button
          type="button"
          fullWidth
          className="max-w-sm"
          color="primary"
          variant="light"
          onPress={() => navigate("/login")}
        >
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-fade">
      <h1 className="text-xl">What's your email address?</h1>
      <form
        className="flex flex-col items-center gap-3 w-full"
        onSubmit={handleSubmit(login)}
      >
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              fullWidth
              className="max-w-sm"
              autoFocus
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              {...field}
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          className="max-w-sm"
          color="primary"
          isLoading={loading}
        >
          Continue with email
        </Button>
        <Button
          type="button"
          fullWidth
          className="max-w-sm"
          color="primary"
          variant="light"
          onPress={() => navigate("/login")}
        >
          Back to login
        </Button>
      </form>
    </div>
  );
}
