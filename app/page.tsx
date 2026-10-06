import PropertiesTable from '@/app/ui/PropertiesTable';
import { Heading } from "@/components/ui/heading";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#F7F9FF]">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
        Home Page

        {/* Placeholder for properties list to test viewing properties -Jacob W*/}
        <Heading level={2}>Managed Properties List</Heading>
        <PropertiesTable />
      </main>
    </div>
  );
}