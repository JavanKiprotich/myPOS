"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard",
      icon: "📊",
      label: "Dashboard",
    },
    {
      href: "/pos",
      icon: "🛒",
      label: "POS",
    },
    {
      href: "/products",
      icon: "🍾",
      label: "Products",
    },
    {
      href: "/inventory",
      icon: "📦",
      label: "Inventory",
    },
    {
      href: "/customers",
      icon: "👥",
      label: "Customers",
    },
    {
      href: "/sales",
      icon: "💰",
      label: "Sales",
    },
    {
      href: "/credit",
      icon: "💳",
      label: "Credit",
    },
    {
      href: "/expenses",
      icon: "🧾",
      label: "Expenses",
    },
   {
  href: "/users",
  icon: "👤",
  label: "Users",
},
    {
  href: "/settings",
  icon: "⚙️",
  label: "Settings",
},

{
  href: "/audit",
  icon: "📋",
  label: "Audit Log",
}

  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen shadow-lg">

      <div className="p-6 border-b border-slate-700">

        <h1 className="text-2xl font-bold">
          🍷 Liquor POS
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Management System
        </p>

      </div>

      <nav className="mt-4">

        {links.map((link) => {

          const active =
            pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-4 transition-all
                ${
                  active
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`}
            >
              <span className="text-xl">
                {link.icon}
              </span>

              <span>
                {link.label}
              </span>

            </Link>
          );
        })}

      </nav>

    </aside>
  );
}