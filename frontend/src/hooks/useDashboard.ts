import { useEffect, useState } from "react";
import type { DashboardData } from "@kumo/shared";

import { getDashboard } from "@/api/dashboard";
import { getErrorMessage } from "@/api/errors";

type DashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: DashboardData };

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getDashboard()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: getErrorMessage(err, "Could not load the dashboard."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  };

  return { state, retry };
}
