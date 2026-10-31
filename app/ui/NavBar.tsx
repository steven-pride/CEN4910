"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.display_name ||
          (user.email ? user.email.split("@")[0] : "User");
        setUserName(name);
      }
    };

    fetchUser();
  }, []);

  // Hide navbar on login and register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

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
              className={clsx(
                "px-3 py-1.5 rounded text-sm font-medium text-center leading-tight hover:bg-blue-700",
                { "bg-blue-800": pathname === "/" }
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/property/empire-state-building"
              className={clsx(
                "px-3 py-1.5 rounded text-sm font-medium text-center leading-tight hover:bg-blue-700",
                {
                  "bg-blue-800":
                    pathname.startsWith("/property/") &&
                    pathname !== "/property/edit",
                }
              )}
            >
              Property Detail
            </Link>
            <Link
              href="/property/edit"
              className={clsx(
                "px-3 py-1.5 rounded text-sm font-medium text-center leading-tight hover:bg-blue-700",
                { "bg-blue-800": pathname === "/property/edit" }
              )}
            >
              Add/Edit Property
            </Link>
            <Link
              href="/admin"
              className={clsx(
                "px-3 py-1.5 rounded text-sm font-medium text-center leading-tight hover:bg-blue-700",
                { "bg-blue-800": pathname === "/admin" }
              )}
            >
              User Management
            </Link>
          </nav>
        </div>

        {/* Right side: User Info, Notifications, Sign Out */}
        <div className="flex items-center gap-4">
          {userName && (
            <div className="bg-blue-600 px-3 py-1.5 rounded text-sm">
              {userName}
            </div>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="cursor-pointer border border-white px-2 py-0.5 rounded text-xs hover:bg-blue-700 text-center leading-tight"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
