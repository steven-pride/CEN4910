"use client";

import properties, { type Property } from "@/data/mockProperties";
import {
  EllipsisVerticalIcon,
} from "@heroicons/react/20/solid";

export default function PropertiesTable() {
  const rows = properties;

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="px-4 py-3">Property Name</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => {
              return (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{p.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      >
                        View Dashboard
                      </button>
                      <button
                        type="button"
                        className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        aria-label={`More actions for ${p.name}`}
                        className="rounded px-1 text-slate-500 hover:bg-slate-100"
                      >
                        <EllipsisVerticalIcon className="size-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}