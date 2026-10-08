import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CurrentUser } from "@kumo/shared";

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

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileFormProps = {
  initialFirstName?: string;
  initialLastName?: string;
  onUpdated: (user: CurrentUser) => void;
};

function ProfileForm({
  initialFirstName,
  initialLastName,
  onUpdated,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialFirstName ?? "",
      lastName: initialLastName ?? "",
    },
  });

  const onSubmit = async ({ firstName, lastName }: ProfileFormValues) => {
    if (!isDirty) return;

    try {
      const updatedUser = await usersApi.updateProfile(firstName, lastName);

      onUpdated(updatedUser);

      reset({
        firstName: updatedUser.firstName ?? "",
        lastName: updatedUser.lastName ?? "",
      });

      notify.success("Profile updated successfully.");
    } catch (err: unknown) {
      notify.error(err, "Could not update profile.");
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </PageSection>
  );
}

export default ProfileForm;
