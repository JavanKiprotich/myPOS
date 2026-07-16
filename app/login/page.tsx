"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = "/pos";
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-lg rounded-lg p-8 w-96">

        <h1 className="text-3xl font-bold text-center mb-6">
          Liquor POS Login
        </h1>

        <div className="mb-4">
          <label className="block mb-2">
            Email
          </label>

          <input
            type="email"
            className="border p-2 w-full rounded"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">
            Password
          </label>

          <input
            type="password"
            className="border p-2 w-full rounded"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        <button
          onClick={login}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded"
        >
          Login
        </button>

      </div>

    </div>
  );
}