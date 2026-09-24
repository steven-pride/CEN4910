import {
  CheckBadgeIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { SystemUser, UserRole } from "@/types";

interface UserManagementTableProps {
  users?: SystemUser[];
  selectedUserIds?: string[];
  totalUserCount?: number;
}

const roleOptions: UserRole[] = [
  "Admin",
  "Property Manager",
  "Read-Only Analyst",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserManagementTable({
  users = [],
  selectedUserIds = [],
  totalUserCount = users.length,
}: UserManagementTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Table Card Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            System Users & Building Assignments
          </h2>
          <p className="text-xs text-slate-500">
            Showing {users.length} of {totalUserCount} registered user accounts
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="w-12 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  aria-label="Select all users"
                />
              </th>
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
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No users found matching the filter criteria.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                const isActive = user.status === "Active";

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        defaultChecked={isSelected}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        aria-label={`Select ${user.fullName}`}
                      />
                    </td>

                    {/* Full Name Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs shrink-0">
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
                            {user.isVerified && (
                              <CheckBadgeIcon
                                className="w-4 h-4 text-blue-500 shrink-0"
                                aria-label="Verified user"
                              />
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.title}
                          </div>
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
                        defaultValue={user.role}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Assigned Buildings Column */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {user.assignedBuildings.map((building) => {
                          const isEntirePortfolio = building.id === -1;

                          return (
                            <span
                              key={building.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                                isEntirePortfolio
                                  ? "bg-slate-800 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span>
                                {building.name}
                                {isEntirePortfolio && building.portfolioCount
                                  ? ` (${building.portfolioCount})`
                                  : ""}
                              </span>
                              {!isEntirePortfolio && (
                                <button
                                  type="button"
                                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                                  aria-label={`Remove ${building.name}`}
                                >
                                  <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </span>
                          );
                        })}

                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-600 border border-blue-400 rounded-full hover:bg-blue-50 focus:outline-none"
                          title="Assign building"
                          aria-label="Assign building"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isActive ? "bg-teal-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-medium ${
                            isActive ? "text-teal-700" : "text-slate-400"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 focus:outline-none"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 rounded hover:bg-rose-100 focus:outline-none"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
