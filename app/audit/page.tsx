"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";

type AuditLog = {
  id: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
  user: {
    name: string;
  } | null;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const response = await fetch("/api/audit");

      if (response.ok) {
        const data: AuditLog[] = await response.json();
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
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap p-4">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="p-4">
                    {log.user?.name ?? "System"}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}