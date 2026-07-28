"use client";

interface DashboardHeaderProps {
  userName: string;
}

export default function DashboardHeader({
  userName,
}: DashboardHeaderProps) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          {greeting}, {userName} 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back to Liquor POS.
        </p>

      </div>

      <div className="text-right">

        <p className="text-sm text-slate-500">
          Today
        </p>

        <h2 className="text-lg font-semibold text-slate-800">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>

      </div>

    </div>
  );
}