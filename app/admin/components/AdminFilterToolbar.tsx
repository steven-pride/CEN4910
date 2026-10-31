"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function AdminFilterToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "All";
  const propertyId = searchParams.get("propertyId") || "All";
  const status = searchParams.get("status") || "All";

  // Fetch properties for the dropdown filter
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

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page"); // Reset page when filters change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updateParam("search", val);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-lg md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-60">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <MagnifyingGlassIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          defaultValue={search}
          onChange={handleInputChange}
          placeholder="Search by name or email..."
          className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={role}
          onChange={(e) => updateParam("role", e.target.value)}
          className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Roles</option>
          <option value="admin">Admin</option>
          <option value="property_manager">Property Manager</option>
          <option value="analyzer">Read-Only Analyst</option>
        </select>

        <select
          value={propertyId}
          onChange={(e) => updateParam("propertyId", e.target.value)}
          className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Properties</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
