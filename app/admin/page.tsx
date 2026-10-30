import { Suspense } from "react";
import AdminHeader from "./components/AdminHeader";
import UserManagementView from "./components/UserManagementView";

export default function AdminPage() {
  return (
    <main className="flex-1 bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <AdminHeader />
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading user management...</div>}>
          <UserManagementView />
        </Suspense>
      </div>
    </main>
  );
}
