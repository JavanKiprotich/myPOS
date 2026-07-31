"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Receipt,
  CreditCard,
  Wallet,
  BarChart3,
  Shield,
  Settings,
  ClipboardList,
  Store,
} from "lucide-react";

type User = {
  name: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
};

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

export default function Sidebar() {
  const pathname = usePathname();

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUser(data);
      } catch (error) {
        console.error(
          "Failed to load user:",
          error
        );
      }
    }

    loadUser();
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const roleLabels = {
    ADMIN: "Administrator",
    MANAGER: "Manager",
    CASHIER: "Cashier",
  };

  const mainLinks: NavLink[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/pos",
      label: "POS",
      icon: ShoppingCart,
    },
    {
      href: "/products",
      label: "Products",
      icon: Package,
    },
    {
      href: "/inventory",
      label: "Inventory",
      icon: Boxes,
    },
    {
      href: "/customers",
      label: "Customers",
      icon: Users,
    },
    {
      href: "/sales",
      label: "Sales",
      icon: Receipt,
    },
    {
      href: "/credit",
      label: "Credit",
      icon: CreditCard,
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: Wallet,
    },
    {
      href: "/reports/profit-loss",
      label: "Profit & Loss",
      icon: BarChart3,
    },
  ];

  const adminLinks: NavLink[] = [
    {
      href: "/admin/stores",
      label: "Stores",
      icon: Store,
    },
    {
      href: "/users",
      label: "Users",
      icon: Shield,
    },
    {
      href: "/audit",
      label: "Audit Log",
      icon: ClipboardList,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900">

      {/* Logo */}
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-slate-800 p-3">
            <Store
              size={24}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              Liquor POS
            </h1>

            <p className="text-sm text-slate-400">
              Retail Management
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">

        {/* Main */}
        <div>
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main
          </div>

          <div className="space-y-2">
            {mainLinks.map((link) => {
              const Icon = link.icon;

              const active =
                pathname === link.href ||
                pathname.startsWith(
                  link.href + "/"
                );

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                    active
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={20} />

                  <span className="font-medium">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin */}
        {user?.role === "ADMIN" && (
          <div>
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Admin
            </div>

            <div className="space-y-2">
              {adminLinks.map((link) => {
                const Icon = link.icon;

                const active =
                  pathname === link.href ||
                  pathname.startsWith(
                    link.href + "/"
                  );

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />

                    <span className="font-medium">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800 p-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || "Loading..."}
            </p>

            <p className="text-xs text-slate-400">
              {user
                ? roleLabels[user.role]
                : ""}
            </p>
          </div>

        </div>
      </div>

    </aside>
  );
}