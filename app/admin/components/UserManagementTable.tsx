"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import TableFooter from "@/app/ui/TableFooter";
import { SystemUser, UserRole, UserStatus } from "@/types";

interface PropertyOption {
  id: number;
  name: string;
}

interface UserManagementTableProps {
  users: SystemUser[];
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  totalUserCount?: number;
  loading?: boolean;
  onRefresh?: () => void;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "property_manager", label: "Property Manager" },
  { value: "analyzer", label: "Read-Only Analyst" },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserManagementTable({
  users = [],
  setUsers,
  totalUserCount = users.length,
  loading = false,
  onRefresh,
}: UserManagementTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [userToAssignProperty, setUserToAssignProperty] = useState<SystemUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

  // Fetch properties for building assignment popover
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const json = await res.json();
          setProperties(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      }
    }
    loadProperties();
  }, []);

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 10;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(newPageSize));
    params.delete("page"); // Reset to page 1
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/userProfiles/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to update user role");
        return;
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
      );
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Error updating role");
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === "Active" ? "Disabled" : "Active";
    try {
      const res = await fetch(`/api/userProfiles/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to update status");
        return;
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: updated.status } : u))
      );
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Error toggling status");
    }
  };

  const handleAssignBuilding = async (userId: string, propertyIdToAdd: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const currentIds = (user.assignedBuildings || []).map((b) => b.id);
    if (currentIds.includes(propertyIdToAdd)) return;

    const updatedIds = [...currentIds, propertyIdToAdd];

    try {
      const res = await fetch(`/api/userProfiles/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedPropertyIds: updatedIds }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to assign property");
        return;
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, assignedBuildings: updated.assignedBuildings } : u
        )
      );
    } catch (err) {
      console.error("Error assigning building:", err);
      alert("Error assigning building");
    }
  };

  const handleRemoveBuilding = async (userId: string, propertyIdToRemove: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updatedIds = (user.assignedBuildings || [])
      .map((b) => b.id)
      .filter((id) => id !== propertyIdToRemove);

    try {
      const res = await fetch(`/api/userProfiles/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedPropertyIds: updatedIds }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to remove property assignment");
        return;
      }

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, assignedBuildings: updated.assignedBuildings } : u
        )
      );
    } catch (err) {
      console.error("Error removing building:", err);
      alert("Error removing building");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/userProfiles/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to delete user");
        return;
      }

      onRefresh?.();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await handleDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
      {/* Table Card Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            System Users & Building Assignments
          </h2>
          <p className="text-xs text-slate-500">
            {loading
              ? "Loading user accounts..."
              : `Showing ${users.length} of ${totalUserCount} registered user accounts`}
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="px-4 py-3">
                Full Name
              </th>
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3">
                Role
              </th>
              <th scope="col" className="px-4 py-3">
                Assigned Buildings
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="w-28 h-3.5 bg-slate-200 rounded" />
                        <div className="w-16 h-2.5 bg-slate-200 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-36 h-3 bg-slate-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-24 h-6 bg-slate-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-32 h-6 bg-slate-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-16 h-5 bg-slate-200 rounded-full" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-block w-12 h-6 bg-slate-200 rounded" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <p className="text-sm font-medium">No users found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search or filter settings.
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isActive = user.status === "Active";

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Full Name Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs shrink-0">
                          {getInitials(user.fullName)}
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                        </div>

                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{user.fullName}</span>
                          </div>
                          {user.title && (
                            <div className="text-xs text-slate-500">
                              {user.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email Column */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-600">
                        {user.email}
                      </span>
                    </td>

                    {/* Role Column */}
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as UserRole)
                        }
                        className="px-2.5 py-1 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Assigned Buildings Column */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {user.assignedBuildings && user.assignedBuildings.length > 0 ? (
                          user.assignedBuildings.map((building) => (
                            <span
                              key={building.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              <span>{building.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveBuilding(user.id, building.id)
                                }
                                className="text-slate-400 hover:text-slate-600 focus:outline-none"
                              >
                                <XMarkIcon className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No properties assigned
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setUserToAssignProperty(user)}
                          className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-blue-600 border border-blue-300 rounded-full hover:bg-blue-50 focus:outline-none"
                          title="Assign building"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setUserToDelete(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 rounded hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        title="Delete user"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination */}
      <TableFooter
        pagination={{
          page,
          pageSize,
          totalCount: totalUserCount,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Modal for Assigning Property */}
      {userToAssignProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign Property
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a property to assign to{" "}
                  <strong className="text-slate-800">
                    {userToAssignProperty.fullName}
                  </strong>{" "}
                  ({userToAssignProperty.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserToAssignProperty(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              {(() => {
                const assignedIds = (
                  userToAssignProperty.assignedBuildings || []
                ).map((b) => b.id);
                const availableProperties = properties.filter(
                  (p) => !assignedIds.includes(p.id)
                );

                if (availableProperties.length === 0) {
                  return (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      All available properties are already assigned to this user.
                    </p>
                  );
                }

                return (
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md">
                    {availableProperties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={async () => {
                          await handleAssignBuilding(
                            userToAssignProperty.id,
                            p.id
                          );
                          setUserToAssignProperty(null);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                          <PlusIcon className="w-3.5 h-3.5" /> Assign
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setUserToAssignProperty(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Delete User Profile
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">{userToDelete.fullName}</strong> (
              {userToDelete.email})? Their account will be removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
