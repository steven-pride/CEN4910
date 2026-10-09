import PortfolioHeader from "@/app/ui/PortfolioHeader";
import PortfolioMetrics from "@/app/ui/PortfolioMetrics";
import BuildingBenchmarkCard from "@/app/ui/BuildingBenchmarkCard";
import ManagedPropertiesTable from "@/app/ui/ManagedPropertiesTable";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
            <div className="flex min-h-screen">
                {/* SIDEBAR */}
                {/* MAIN */}
                <div className="min-w-0 flex lg:ml-[225px] w-full">
                    {/* TOPBAR */}

                    <main className="px-4 py-5 md:px-6 lg:px-7">
                        {/* PAGE HEADER */}
                        <PortfolioHeader />

                        {/* KPI CARDS */}
                        <PortfolioMetrics />

                        {/* BENCHMARK */}
                        <BuildingBenchmarkCard />

                        {/* MANAGED PROPERTIES */}
                        <ManagedPropertiesTable />
                    </main>
                </div>
            </div>
        </div>
    );
}