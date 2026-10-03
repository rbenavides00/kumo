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
}) {
  const inputId = useId();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { value: initialValue },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ value: initialValue });
    }
  }, [isOpen, initialValue, reset]);

  const submit = async ({ value }) => {
    try {
      await onSubmit(value.trim());
      onClose();
    } catch (error) {
      setError("root", {
        message: error.response?.data?.error ?? "Something went wrong",
      });
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

          <FieldError errors={[errors.root]} />

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
