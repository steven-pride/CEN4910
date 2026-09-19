"use client";

import { useState } from "react";
import Link from "next/link";

export default function NavBar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <header className="bg-blue-600 text-white">
      <div className="flex items-center justify-between px-6 py-2">
        {/* Left side: Logo and Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            Building Energy Tracker
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              onClick={() => setActive("Dashboard")}
              className={`px-3 py-2 rounded text-sm font-medium ${
                active === "Dashboard" ? "bg-blue-800" : "hover:bg-blue-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/"
              onClick={() => setActive("Property Detail")}
              className={`px-3 py-1.5 rounded text-sm font-medium text-center leading-tight ${
                active === "Property Detail" ? "bg-blue-800" : "hover:bg-blue-700"
              }`}
            >
              Property Detail
            </Link>
            <Link
              href="/"
              onClick={() => setActive("Add/Edit Property")}
              className={`px-3 py-1.5 rounded text-sm font-medium text-center leading-tight ${
                active === "Add/Edit Property" ? "bg-blue-800" : "hover:bg-blue-700"
              }`}
            >
              Add/Edit Property
            </Link>
            <Link
              href="/"
              onClick={() => setActive("User Management")}
              className={`px-3 py-1.5 rounded text-sm font-medium text-center leading-tight ${
                active === "User Management" ? "bg-blue-800" : "hover:bg-blue-700"
              }`}
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
