import { getErrorMessage } from "@/api/errors";
import { toast } from "@/components/ui/toast";

export const notify = {
  success: (title: string, description?: string) =>
    toast.add({ type: "success", title, description }),

  error: (error: unknown, fallback: string) =>
    toast.add({ type: "error", title: getErrorMessage(error, fallback) }),
};
