import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageSection } from "@/components/shared/Page";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import * as usersApi from "@/api/users";
import { notify } from "@/utils/notify";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: "New passwords do not match",
      path: ["confirmPassword"],
    },
  );

type FormValues = z.infer<typeof passwordSchema>;

const defaultValues: FormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function PasswordField({
  name,
  label,
  error,
  register,
  disabled,
}: {
  name: keyof FormValues;
  label: string;
  error?: { message?: string };
  register: ReturnType<typeof useForm<FormValues>>["register"];
  disabled: boolean;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>

      <Input
        {...register(name)}
        id={name}
        type="password"
        autoComplete={
          name === "currentPassword" ? "current-password" : "new-password"
        }
        aria-invalid={!!error}
        disabled={disabled}
      />

      <FieldError errors={[error]} />
    </Field>
  );
}

function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues,
  });

  const onSubmit = async ({ currentPassword, newPassword }: FormValues) => {
    try {
      await usersApi.updatePassword(currentPassword, newPassword);
      reset(defaultValues);
      notify.success("Password updated successfully.");
    } catch (err: unknown) {
      notify.error(err, "Could not update password.");
    }
  };

  return (
    <PageSection title="Change password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FieldGroup>
          <PasswordField
            name="currentPassword"
            label="Current password"
            error={errors.currentPassword}
            register={register}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PasswordField
              name="newPassword"
              label="New password"
              error={errors.newPassword}
              register={register}
              disabled={isSubmitting}
            />

            <PasswordField
              name="confirmPassword"
              label="Confirm new password"
              error={errors.confirmPassword}
              register={register}
              disabled={isSubmitting}
            />
          </div>
        </FieldGroup>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </PageSection>
  );
}

export default PasswordForm;
