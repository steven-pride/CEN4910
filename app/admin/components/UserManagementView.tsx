"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminFilterToolbar from "./AdminFilterToolbar";
import UserManagementTable from "./UserManagementTable";
import { SystemUser } from "@/types";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function UserManagementView() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "All";
  const propertyId = searchParams.get("propertyId") || "All";
  const status = searchParams.get("status") || "All";
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "10";

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (role && role !== "All") params.set("role", role);
        if (propertyId && propertyId !== "All") params.set("propertyId", propertyId);
        if (status && status !== "All") params.set("status", status);
        params.set("page", page);
        params.set("pageSize", pageSize);

        const res = await fetch(`/api/userProfiles?${params.toString()}`);
        if (!isMounted) return;

        if (!res.ok) {
          if (res.status === 401) {
            setError("You must be logged in to view the Admin management console.");
            return;
          }
          if (res.status === 403) {
            setError("Access denied: You must have Administrator privileges to access this page.");
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Request failed with status ${res.status}`);
        }

        const json = await res.json();
        if (isMounted) {
          setUsers(json.data || []);
          setTotalCount(json.pagination?.totalCount ?? 0);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Failed to load user profiles";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [search, role, propertyId, status, page, pageSize, refreshTrigger]);

  return (
    <div className="flex flex-col gap-6">
      {/* Error Boundary / Notification */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <AdminFilterToolbar />

      {/* Live User Management Table with embedded TableFooter */}
      <UserManagementTable
        users={users}
        setUsers={setUsers}
        totalUserCount={totalCount}
        loading={loading}
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
}
