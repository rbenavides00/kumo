import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

import { notify } from "@/utils/notify";

type PromptDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void | Promise<void>;
  title: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  suffix?: string;
  submitLabel?: string;
  validate?: (value: string) => string | null;
  showToasts?: boolean;
};

type FormValues = { value: string };

function PromptDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  label,
  placeholder,
  initialValue = "",
  suffix,
  submitLabel = "Save",
  validate,
  showToasts = false,
}: PromptDialogProps) {
  const inputId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { value: initialValue },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ value: initialValue });
    }
  }, [isOpen, initialValue, reset]);

  const submit = async ({ value }: FormValues) => {
    try {
      await onSubmit(value.trim());
      onClose();
      showToasts && notify.success("Changes saved successfully.");
    } catch (err: unknown) {
      showToasts &&
        notify.error(err, "Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <Field data-invalid={!!errors.value}>
            {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}

            <InputGroup>
              <InputGroupInput
                {...register("value", {
                  validate: (value) => validate?.(value.trim()) ?? true,
                })}
                id={inputId}
                placeholder={placeholder}
                aria-label={label ? undefined : title}
                aria-invalid={!!errors.value}
                disabled={isSubmitting}
                autoComplete="off"
              />

              {suffix && (
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{suffix}</InputGroupText>
                </InputGroupAddon>
              )}
            </InputGroup>

            <FieldError errors={[errors.value]} />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PromptDialog;
