"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const response = await fetch("/api/audit");

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="p-6">

      <PageHeader
        title="Audit Log"
        description="Track every important action in the system."
      />

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow">

        <table className="w-full">

          <thead className="border-b bg-gray-50">

            <tr>

              <th className="p-4 text-left">Time</th>

              <th className="p-4 text-left">User</th>

              <th className="p-4 text-left">Action</th>

              <th className="p-4 text-left">Target</th>

              <th className="p-4 text-left">Details</th>

            </tr>

          </thead>

          <tbody>

            {logs.map((log) => (

              <tr
                key={log.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>

                <td className="p-4">
                  {log.user?.name}
                </td>

                <td className="p-4">
                  {log.action}
                </td>

                <td className="p-4">
                  {log.target}
                </td>

                <td className="p-4">
                  {log.details}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}