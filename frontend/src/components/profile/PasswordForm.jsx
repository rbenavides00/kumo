import { useState } from "react";
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

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

const emptyValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function PasswordForm() {
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: emptyValues,
  });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    clearErrors("root");
    setSuccessMessage(null);

    try {
      await usersApi.updatePassword(currentPassword, newPassword);
      reset(emptyValues);
      setSuccessMessage("Password updated");
    } catch (err) {
      setError("root", {
        type: "server",
        message: err.response?.data?.error ?? "Could not update password",
      });
    }
  };

  return (
    <PageSection title="Change password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FieldGroup>
          <Field data-invalid={!!errors.currentPassword}>
            <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>

            <Input
              {...register("currentPassword")}
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              disabled={isSubmitting}
            />

            <FieldError errors={[errors.currentPassword]} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>

              <Input
                {...register("newPassword")}
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                disabled={isSubmitting}
              />

              <FieldError errors={[errors.newPassword]} />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm new password
              </FieldLabel>

              <Input
                {...register("confirmPassword")}
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                disabled={isSubmitting}
              />

              <FieldError errors={[errors.confirmPassword]} />
            </Field>
          </div>
        </FieldGroup>

        <FieldError errors={[errors.root]} />

        {successMessage && !isDirty && (
          <p className="text-sm text-green-600 dark:text-green-500">
            {successMessage}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </PageSection>
  );
}

export default PasswordForm;
