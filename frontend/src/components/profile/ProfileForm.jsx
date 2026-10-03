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

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
});

function ProfileForm({ initialFirstName, initialLastName, onUpdated }) {
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialFirstName ?? "",
      lastName: initialLastName ?? "",
    },
  });

  const onSubmit = async ({ firstName, lastName }) => {
    if (!isDirty) return;

    clearErrors("root");
    setSuccessMessage(null);

    try {
      const updatedUser = await usersApi.updateProfile(firstName, lastName);
      onUpdated(updatedUser);

      reset({
        firstName: updatedUser.first_name ?? "",
        lastName: updatedUser.last_name ?? "",
      });
      setSuccessMessage("Profile updated");
    } catch (err) {
      setError("root", {
        type: "server",
        message: err.response?.data?.error ?? "Could not update profile",
      });
    }
  };

  return (
    <PageSection title="Personal information">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>

            <Input
              {...register("firstName")}
              id="firstName"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              disabled={isSubmitting}
            />

            <FieldError errors={[errors.firstName]} />
          </Field>

          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>

            <Input
              {...register("lastName")}
              id="lastName"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              disabled={isSubmitting}
            />

            <FieldError errors={[errors.lastName]} />
          </Field>
        </FieldGroup>

        <FieldError errors={[errors.root]} />

        {successMessage && !isDirty && (
          <p className="text-sm text-green-600 dark:text-green-500">
            {successMessage}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </PageSection>
  );
}

export default ProfileForm;
