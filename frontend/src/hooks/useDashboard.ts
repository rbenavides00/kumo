import { useEffect, useState } from "react";
import type { DashboardData } from "@kumo/shared";

import { getDashboard } from "@/api/dashboard";

type DashboardState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: DashboardData };

export function useDashboard(): DashboardState {
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getDashboard()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
