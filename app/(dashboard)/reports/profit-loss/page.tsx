"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Toast from "@/components/ui/Toast";

type ProfitLossReport = {
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  salesCount: number;
  expenseCount: number;
};

export default function ProfitLossPage() {
  const today = new Date();
  const todayString = today
    .toISOString()
    .slice(0, 10);

  const [startDate, setStartDate] =
    useState(todayString);

  const [endDate, setEndDate] =
    useState(todayString);

  const [report, setReport] =
    useState<ProfitLossReport | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as
      | "success"
      | "error",
  });

  function showToast(
    message: string,
    type: "success" | "error" = "success"
  ) {
    setToast({
      show: true,
      message,
      type,
    });

    window.setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 2500);
  }

  async function loadReport() {
    if (!startDate || !endDate) {
      showToast(
        "Select a start and end date.",
        "error"
      );
      return;
    }

    if (startDate > endDate) {
      showToast(
        "Start date cannot be after end date.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/reports/profit-loss?start=${startDate}&end=${endDate}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load report."
        );
      }

      setReport(data);
    } catch (error) {
      console.error(error);

      setReport(null);

      showToast(
        error instanceof Error
          ? error.message
          : "Failed to load report.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const money = (value: number) =>
    `KES ${Number(
      value
    ).toLocaleString()}`;

  return (
    <div className="space-y-8">

      <PageHeader
        title="Profit & Loss"
        description="Track revenue, cost of goods sold, expenses and profitability."
      />

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={loadReport}
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Run Report"}
            </button>
          </div>

        </div>
      </Card>

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <Card className="p-6">
              <div className="text-sm text-slate-500">
                Revenue
              </div>

              <div className="mt-2 text-2xl font-bold text-slate-900">
                {money(report.revenue)}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-slate-500">
                Cost of Goods Sold
              </div>

              <div className="mt-2 text-2xl font-bold text-red-600">
                {money(report.cogs)}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-slate-500">
                Gross Profit
              </div>

              <div className="mt-2 text-2xl font-bold text-emerald-600">
                {money(report.grossProfit)}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-slate-500">
                Net Profit
              </div>

              <div
                className={`mt-2 text-2xl font-bold ${
                  report.netProfit >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {money(report.netProfit)}
              </div>
            </Card>

          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Profit & Loss Breakdown
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between border-b pb-4">
                <span>Sales Revenue</span>
                <strong>
                  {money(report.revenue)}
                </strong>
              </div>

              <div className="flex justify-between border-b pb-4 text-red-600">
                <span>
                  Cost of Goods Sold
                </span>

                <strong>
                  - {money(report.cogs)}
                </strong>
              </div>

              <div className="flex justify-between border-b pb-4 text-emerald-600">
                <span>
                  Gross Profit
                </span>

                <strong>
                  {money(report.grossProfit)}
                </strong>
              </div>

              <div className="flex justify-between border-b pb-4 text-red-600">
                <span>
                  Operating Expenses
                </span>

                <strong>
                  - {money(report.expenses)}
                </strong>
              </div>

              <div className="flex justify-between pt-2 text-lg">
                <span className="font-semibold">
                  Net Profit
                </span>

                <strong
                  className={
                    report.netProfit >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  {money(report.netProfit)}
                </strong>
              </div>

            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">

            <Card className="p-6">
              <div className="text-sm text-slate-500">
                Gross Margin
              </div>

              <div className="mt-2 text-3xl font-bold text-slate-900">
                {report.grossMargin.toFixed(1)}%
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-slate-500">
                Net Margin
              </div>

              <div className="mt-2 text-3xl font-bold text-slate-900">
                {report.netMargin.toFixed(1)}%
              </div>
            </Card>

          </div>

          <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <div className="text-sm text-slate-500">
                  Completed Sales
                </div>

                <div className="mt-2 text-2xl font-bold">
                  {report.salesCount}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500">
                  Expenses
                </div>

                <div className="mt-2 text-2xl font-bold">
                  {report.expenseCount}
                </div>
              </div>

            </div>
          </Card>
        </>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />

    </div>
  );
}