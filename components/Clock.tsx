"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
        <div className="h-8 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">

      <div className="text-2xl font-bold tabular-nums text-slate-900">
        {now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })}
      </div>

      <div className="text-xs text-slate-500">
        {now.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>

    </div>
  );
}