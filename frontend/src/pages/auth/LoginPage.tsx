import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/context/AuthContext";
import usePageTitle from "@/hooks/usePageTitle";
import { notify } from "@/utils/notify";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  usePageTitle("Login");

  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async ({ username, password }: LoginFormValues) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 3000));
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      notify.error(err, "Could not log in. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials below to log in to your account.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="pb-6">
          <FieldGroup>
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="username">Username</FieldLabel>

              <Input
                {...register("username")}
                id="username"
                autoComplete="username"
                aria-invalid={!!errors.username}
                disabled={isSubmitting}
              />

              <FieldError errors={[errors.username]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>

              <Input
                {...register("password")}
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                disabled={isSubmitting}
              />

              <FieldError errors={[errors.password]} />
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default LoginPage;
