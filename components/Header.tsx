"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const response = await fetch("/api/auth/me");

    if (response.ok) {
      setUser(await response.json());
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  }

  return (
    <header className="bg-white shadow px-8 py-4 flex justify-between items-center">

      <div>

        <h2 className="text-2xl font-bold">
          Liquor POS
        </h2>

        <p className="text-gray-500">
          {new Date().toLocaleDateString()}
        </p>

      </div>

      <div className="flex items-center gap-5">

        {user && (

          <div className="text-right">

            <div className="font-semibold">
              {user.name}
            </div>

            <div className="text-gray-500 text-sm">
              {user.role}
            </div>

          </div>

        )}

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>

    </header>
  );
}