import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type DonutSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
  formatValue?: (value: number) => string;
};

function DonutChart({
  slices,
  centerValue,
  centerLabel,
  formatValue = String,
}: DonutChartProps) {
  const config: ChartConfig = Object.fromEntries(
    slices.map((slice) => [
      slice.key,
      { label: slice.label, color: slice.color },
    ]),
  );

  const data = slices.map((slice) => ({
    key: slice.key,
    value: slice.value,
    fill: `var(--color-${slice.key})`,
  }));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-48">
      <ChartContainer config={config} className="aspect-square size-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                nameKey="key"
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {config[String(name)]?.label}
                    </span>
                    <span className="font-mono font-medium">
                      {formatValue(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />

          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius="65%"
            strokeWidth={2}
          />
        </PieChart>
      </ChartContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold">{centerValue}</span>
        <span className="text-xs text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
  );
}

export default DonutChart;
