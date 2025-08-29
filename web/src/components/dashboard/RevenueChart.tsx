"use client";
import { useRevenueSeries } from "@/hooks/useAnalytics";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

export default function RevenueChart() {
  const { data: series } = useRevenueSeries({ interval: "month" });
  const { x, y } = useMemo(() => {
    // Build a 12-month window ending this month, with zero-filled values
    const end = new Date();
    const endUTC = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1)
    );
    const months: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(
        Date.UTC(endUTC.getUTCFullYear(), endUTC.getUTCMonth() - i, 1)
      );
      months.push(d);
    }

    // Map API series by YYYY-MM (UTC) for stable lookup
    const map = new Map<string, number>();
    (series || []).forEach((b) => {
      const d = new Date(b.bucket);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}`;
      map.set(key, (b.amountMinor ?? 0) / 100);
    });

    const x = months.map((d) =>
      d.toLocaleDateString(undefined, { month: "short", year: "numeric" })
    );
    const y = months.map((d) => {
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}`;
      return map.get(key) ?? 0;
    });

    return { x, y };
  }, [series]);

  const option: EChartsOption = useMemo(
    () =>
      ({
        tooltip: { trigger: "axis" },
        grid: { left: 8, right: 8, top: 16, bottom: 24, containLabel: true },
        xAxis: {
          type: "category",
          data: x,
          axisTick: { alignWithLabel: true },
        },
        yAxis: {
          type: "value",
          axisLabel: { formatter: (v: number) => `${v.toFixed(0)} RON` },
        },
        series: [
          {
            name: "Venituri",
            type: "bar",
            data: y,
            itemStyle: { color: "#2563eb" },
            emphasis: { focus: "series" },
          },
        ],
      } as EChartsOption),
    [x, y]
  );

  return (
    <div className="mt-4">
      <ReactECharts option={option} notMerge={true} style={{ height: 180 }} />
    </div>
  );
}
