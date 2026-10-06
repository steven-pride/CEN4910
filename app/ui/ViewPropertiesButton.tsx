import Link from "next/link";
import type { Property } from "@/data/mockProperties";

export default function ViewPropertiesButton({ property }: { property: Property }) {
  return (
    <Link 
      href={`/property/${property.id}`}
      className="rounded bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      View
    </Link>
  );
}