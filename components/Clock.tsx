"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Prevent server/client hydration mismatch
  if (!mounted || !time) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <div className="relative h-7 w-7 shrink-0 rounded-full border-2 border-slate-400 bg-white shadow-sm" />
        <span>--:--:-- --</span>
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle =
    ((hours % 12) + minutes / 60) * 30;

  const minuteAngle =
    minutes * 6 + seconds * 0.1;

  const secondAngle = seconds * 6;

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      
      {/* Analog clock */}
      <div className="relative h-7 w-7 shrink-0 rounded-full border-2 border-slate-400 bg-white shadow-sm">

        {/* 12 small tick marks */}
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = index * 30;

          return (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 h-[2px] w-[4px] rounded-full bg-slate-400"
              style={{
                transform: `rotate(${angle}deg) translateX(8px) translateY(-50%)`,
              }}
            />
          );
        })}

        {/* Hour hand */}
        <div
          className="absolute left-1/2 top-1/2 h-2 w-[2px] origin-bottom rounded-full bg-slate-800"
          style={{
            transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
          }}
        />

        {/* Minute hand */}
        <div
          className="absolute left-1/2 top-1/2 h-[9px] w-[1.5px] origin-bottom rounded-full bg-slate-600"
          style={{
            transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
          }}
        />

        {/* Second hand */}
        <div
          className="absolute left-1/2 top-1/2 h-[10px] w-[1px] origin-bottom bg-red-500"
          style={{
            transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
          }}
        />

        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800" />
      </div>

      {/* Digital clock */}
      <span>
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    </div>
  );
}