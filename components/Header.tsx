"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Clock from "@/components/Clock";






export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [runningBillCount, setRunningBillCount] = useState(0);

  const [notifications, setNotifications] = useState<any[]>([]);
  
const [search, setSearch] = useState("");
const [searchResults, setSearchResults] = useState({
  products: [],
  customers: [],
  sales: [],
});
const [showSearchResults, setShowSearchResults] = useState(false);
const [searchLoading, setSearchLoading] = useState(false);


useEffect(() => {
  setSelectedSearchIndex(-1);
}, [search]);


useEffect(() => {
  const query = search.trim();

  if (!query) {
    setSearchResults({
      products: [],
      customers: [],
      sales: [],
    });

    setShowSearchResults(false);
    return;
  }

  const timer = setTimeout(() => {
    performGlobalSearch(query);
  }, 300);

  return () => clearTimeout(timer);
}, [search]);




async function performGlobalSearch(query: string) {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    setSearchResults({
      products: [],
      customers: [],
      sales: [],
    });

    setShowSearchResults(false);
    return;
  }

  try {
    setSearchLoading(true);

    const response = await fetch(
      `/api/search?q=${encodeURIComponent(cleanQuery)}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setSearchResults({
        products: [],
        customers: [],
        sales: [],
      });

      return;
    }

    setSearchResults({
      products: Array.isArray(data.products)
        ? data.products
        : [],

      customers: Array.isArray(data.customers)
        ? data.customers
        : [],

      sales: Array.isArray(data.sales)
        ? data.sales
        : [],
    });

    setShowSearchResults(true);
  } catch (error) {
    console.error(
      "Global search failed:",
      error
    );

    setSearchResults({
      products: [],
      customers: [],
      sales: [],
    });
  } finally {
    setSearchLoading(false);
  }
}

async function loadNotifications() {
  try {
    const response = await fetch("/api/notifications", {
      cache: "no-store",
    });

    if (!response.ok) {
      setNotifications([]);
      return;
    }

    const data = await response.json();

    setNotifications(
      Array.isArray(data.notifications)
        ? data.notifications
        : []
    );
  } catch (error) {
    console.error(
      "Failed to load notifications:",
      error
    );

    setNotifications([]);
  }
}


  useEffect(() => {
  loadUser();
  loadRunningBillCount();

  const interval = setInterval(() => {
    loadRunningBillCount();
  }, 30000);

  return () => clearInterval(interval);
}, []);

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me");

      if (response.ok) {
        setUser(await response.json());
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }

async function loadRunningBillCount() {
  try {
    const response = await fetch("/api/running-bills", {
      cache: "no-store",
    });

    if (!response.ok) {
      setRunningBillCount(0);
      return;
    }

    const data = await response.json();

    setRunningBillCount(
      Array.isArray(data) ? data.length : 0
    );
  } catch (error) {
    console.error(
      "Failed to load running bill count:",
      error
    );

    setRunningBillCount(0);
  }
}


  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/login";
    }
  }

  const notificationCount = notifications.length;


  const searchItems = [
  ...searchResults.products.map((item: any) => ({
    type: "product",
    id: item.id,
    href: `/products/${item.id}`,
    title: item.name,
    subtitle: `${item.category} · ${item.sku}`,
  })),

  ...searchResults.customers.map((item: any) => ({
    type: "customer",
    id: item.id,
    href: `/customers/${item.id}`,
    title: item.name,
    subtitle: item.phone,
  })),

  ...searchResults.sales.map((item: any) => ({
    type: "sale",
    id: item.id,
    href: `/receipt/${item.id}`,
    title: `Sale #${item.id.slice(-8)}`,
    subtitle: `KES ${item.total.toLocaleString()}`,
  })),
];

  return (
    <header className="bg-white border-b shadow-sm px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">

        {/* LEFT */}
        <div className="min-w-fit">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
           {user?.store?.name || "Liquor POS"}
          </h2>

          <div className="text-sm text-slate-500">
            <Clock />
          </div>
        </div>

        {/* CENTER SEARCH */}
        <div className="relative flex-1 max-w-xl">
  <input
    type="text"
    placeholder="Search products, customers, sales..."
    value={search}
    onChange={(e) => {
  setSearch(e.target.value);
}}
    onFocus={() => {
      if (search.trim()) {
        setShowSearchResults(true);
      }
    }}

onKeyDown={(e) => {
  if (e.key === "Escape") {
    setShowSearchResults(false);
    setSelectedSearchIndex(-1);
    return;
  }

  if (
    !showSearchResults ||
    searchItems.length === 0
  ) {
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();

    setSelectedSearchIndex((current) =>
      current < searchItems.length - 1
        ? current + 1
        : 0
    );

    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();

    setSelectedSearchIndex((current) =>
      current > 0
        ? current - 1
        : searchItems.length - 1
    );

    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();

    const selected =
      searchItems[selectedSearchIndex];

    if (selected) {
      window.location.href = selected.href;
    }
  }
}}


    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 outline-none transition focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
  />

  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
    🔍
  </span>

  {showSearchResults && (
  <div className="absolute left-0 right-0 top-12 z-[100] overflow-hidden rounded-xl border bg-white shadow-2xl">

    {searchLoading ? (
      <div className="p-4 text-sm text-slate-500">
        Searching...
      </div>
    ) : searchItems.length === 0 ? (
      <div className="p-5 text-center text-sm text-slate-500">
        No results found.
      </div>
    ) : (
      <div className="max-h-96 overflow-y-auto">

        {searchItems.map(
          (item: any, index: number) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              onClick={() => {
                setSearch("");
                setShowSearchResults(false);
                setSelectedSearchIndex(-1);
              }}
              className={`block border-b px-4 py-3 last:border-b-0 ${
                selectedSearchIndex === index
                  ? "bg-slate-100"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">
                    {item.title}
                  </div>

                  <div className="text-xs text-slate-500">
                    {item.subtitle}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                    item.type === "product"
                      ? "bg-blue-50 text-blue-700"
                      : item.type === "customer"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {item.type}
                </span>

              </div>
            </Link>
          )
        )}

      </div>
    )}
  </div>
)}
</div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 lg:gap-4">

          {/* ONLINE STATUS */}
          <div className="hidden lg:flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Online
          </div>

          {/* NEW SALE */}
          <Link
            href="/pos"
            className="hidden sm:inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Sale
          </Link>

       <Link
  href="/pos?runningBills=open"
  className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
>
  📋 Running Bills
  {runningBillCount > 0 && (
    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
      {runningBillCount}
    </span>
  )}
</Link>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowNotifications((value) => !value)
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100"
              aria-label="Notifications"
            >
              🔔

              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-white shadow-xl">

                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="font-semibold">
                    Notifications
                  </h3>

                  <span className="text-xs text-slate-500">
                    {notificationCount} alerts
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border-b px-4 py-3 last:border-b-0"
                    >
                      <div className="font-medium text-slate-900">
                        {notification.title}
                      </div>

                      <div className="mt-1 text-sm text-slate-500">
                        {notification.message}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t px-4 py-3">
                  <Link
                    href="/settings"
                    className="text-sm font-medium text-blue-600 hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    Notification settings
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* USER MENU */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowUserMenu((value) => !value)
              }
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-100"
            >
              <div className="hidden sm:block text-right">
                {user && (
                  <>
                    <div className="font-semibold text-sm text-slate-900">
                      {user.name}
                    </div>

                    <div className="text-xs text-slate-500">
                      {user.role}
                    </div>
                  </>
                )}
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>

              <span className="hidden sm:block text-slate-400">
                ▾
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border bg-white p-2 shadow-xl">

                <div className="border-b px-3 py-3">
                  <div className="font-semibold">
                    {user?.name ?? "User"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {user?.email ?? ""}
                  </div>

                  <div className="mt-1 text-xs font-medium text-slate-700">
                    {user?.role ?? ""}
                  </div>
                </div>

                <Link
                  href="/settings"
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  ⚙️ Settings
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="mt-3 md:hidden relative">
        <input
          type="text"
          placeholder="Search products, customers, sales..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 outline-none focus:bg-white focus:border-slate-400"
        />

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
      </div>
    </header>
  );
}