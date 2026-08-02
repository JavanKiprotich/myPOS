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
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
  storeId: string;

  store: {
    id: string;
    name: string;
    location: string | null;
  };
};

type StoreItem = {
  id: string;
  name: string;
  location: string | null;
};

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

export default function Sidebar() {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);

  const [stores, setStores] = useState<StoreItem[]>([]);

  const [currentStore, setCurrentStore] =
    useState("");

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me");

      if (!response.ok) return;

      const data = await response.json();

      setUser(data);

      setCurrentStore(data.storeId);

      const storesResponse =
        await fetch("/api/stores");

      if (storesResponse.ok) {
        const storesData =
          await storesResponse.json();

        setStores(storesData);
      }

    } catch (error) {
      console.error(error);
    }
  }

  async function switchStore(storeId: string) {
    try {
      const response = await fetch(
        "/api/stores/switch",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            storeId,
          }),
        }
      );

      if (response.ok) {
        window.location.reload();
      } else {
        const error =
          await response.json();

        alert(
          error.error ||
            "Failed to switch store."
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
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

      <div className="border-b border-slate-800 p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-slate-800 p-3">
            <Store
              size={24}
              className="text-white"
            />
          </div>

          <div className="flex-1">

            <h1 className="text-xl font-bold text-white">
              Liquor POS
            </h1>

            <p className="text-sm text-slate-400">
              Retail Management
            </p>

            {user?.role === "ADMIN" && (
              <div className="mt-5">

                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Current Store
                </label>

                <select
                  value={currentStore}
                  onChange={(e) => {
                    setCurrentStore(
                      e.target.value
                    );

                    switchStore(
                      e.target.value
                    );
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
                >
                  {stores.map((store) => (
                    <option
                      key={store.id}
                      value={store.id}
                    >
                      {store.name}
                    </option>
                  ))}
                </select>

              </div>
            )}

            {user &&
              user.role !== "ADMIN" && (
                <div className="mt-5 rounded-lg bg-slate-800 p-3">

                  <p className="text-xs uppercase text-slate-400">
                    Current Store
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {user.store.name}
                  </p>

                  {user.store.location && (
                    <p className="text-xs text-slate-400">
                      {user.store.location}
                    </p>
                  )}

                </div>
              )}

          </div>

        </div>

      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">

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
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={20} />

                  <span>
                    {link.label}
                  </span>

                </Link>
              );
            })}

          </div>

        </div>

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
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />

                    <span>
                      {link.label}
                    </span>

                  </Link>
                );
              })}

            </div>

          </div>

        )}

      </nav>

      <div className="border-t border-slate-800 p-4">

        <div className="flex items-center gap-3 rounded-xl bg-slate-800 p-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            {initials}
          </div>

          <div>

            <p className="font-semibold text-white">
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