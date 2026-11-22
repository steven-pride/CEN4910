import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold text-slate-900">Access Forbidden</h1>
      <p className="text-slate-600">
        You do not have the required authorization to edit this property.
      </p>
      <Link href="/" className="font-semibold text-blue-600 hover:underline">
        Return to dashboard
      </Link>
    </main>
  );
}
