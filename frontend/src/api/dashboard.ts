import type { DashboardData } from "@kumo/shared";

import api from "./client";

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/dashboard");
  return data;
}
