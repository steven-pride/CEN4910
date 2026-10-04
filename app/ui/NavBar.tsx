"use client";

import { useState } from "react";
import Link from "next/link";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const [active, setActive] = useState("Dashboard");
  const pathname = usePathname();
  return (
    <header className="bg-blue-600 text-white">
      <div className="flex items-center justify-between px-6 py-2">
        {/* Left side: Logo and Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <BuildingOffice2Icon className="w-5 h-5 shrink-0" />
            <span>Building Energy Tracker</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              onClick={() => setActive("Dashboard")}
              className={clsx(
                  'px-3 py-1.5 rounded text-sm font-medium text-center leading-tight hover:bg-blue-700',
                  { "bg-blue-800": pathname === "/"}
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/"
              onClick={() => setActive("Property Detail")}
              className={clsx(
                  'px-3 py-1.5 rounded text-sm font-medium text-center leading-tight hover:bg-blue-700',
                  { "bg-blue-800": pathname === "/property"}
              )}
            >
              Property Detail
            </Link>
            <Link
              href="/"
              onClick={() => setActive("Add/Edit Property")}
              className={clsx(
                  'px-3 py-1.5 rounded text-sm font-medium text-center leading-tight hover:bg-blue-700',
                  { "bg-blue-800": pathname === "/property/new"}
              )}
            >
              Add/Edit Property
            </Link>
            <Link
              href="/admin"
              onClick={() => setActive("User Management")}
              className={clsx(
                  'px-3 py-1.5 rounded text-sm font-medium text-center leading-tight hover:bg-blue-700',
                  { "bg-blue-800": pathname === "/admin"}
              )}
            >
              User Management
            </Link>
          </nav>
        </div>

        {/* Right side: User Info, Notifications, Sign Out */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 px-3 py-1.5 rounded text-sm">
            Energy Admin
          </div>

          <button
            type="button"
            className="border border-white px-2 py-0.5 rounded text-xs hover:bg-blue-700 text-center leading-tight"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
