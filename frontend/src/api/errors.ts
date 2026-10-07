import axios from "axios";
import type { ApiErrorResponse } from "@kumo/shared";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error ?? fallback;
  }

  return fallback;
}
