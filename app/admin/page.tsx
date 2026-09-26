import AdminFilterToolbar from "./components/AdminFilterToolbar";
import AdminHeader from "./components/AdminHeader";
import TableFooter from "@/app/ui/TableFooter";
import { mockUsers } from "@/data/mockUsers";

export default function AdminPage() {
  const activeCount = mockUsers.filter((u) => u.status === "Active").length;

  return (
    <main className="flex-1 bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top Header */}
        <AdminHeader totalActiveCount={activeCount} />

        {/* Filters & Search Toolbar */}
        <AdminFilterToolbar />

        {/* Table Footer with Pagination */}
        <TableFooter
          pagination={{
            page: 1,
            pageSize: 5,
            totalCount: mockUsers.length,
          }}
        />
      </div>
    </main>
  );
}
