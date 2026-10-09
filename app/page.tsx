"use client";

import { useMemo, useState } from "react";
import {
    CloudArrowUpIcon, BuildingOfficeIcon, PlusCircleIcon, CloudArrowDownIcon,
    UserIcon, MagnifyingGlassIcon, DocumentIcon, ClockIcon, EllipsisHorizontalIcon,
    Cog6ToothIcon, MapPinIcon, BoltIcon
} from "@heroicons/react/24/outline";

const benchmarks = [
    {
        name: "Empire State Tower",
        value: 54.2,
        percent: 54.2 / 1.2,
        detail: "-16.6% vs Target",
        status: "good",
    },
    {
        name: "Midtown Plaza",
        value: 51.8,
        percent: 51.8 / 1.2,
        detail: "-20.3% vs Target",
        status: "good",
    },
    {
        name: "Hudson Yards 4",
        value: 79.4,
        percent: 79.4 / 1.2,
        detail: "+22.1% Spiking",
        status: "danger",
    },
    {
        name: "Pacific Heights Center",
        value: 62.0,
        percent: 62 / 1.2,
        detail: "-4.6% Compliant",
        status: "normal",
    },
    {
        name: "Boston Harbor Plaza",
        value: 64.5,
        percent: 64.5 / 1.2,
        detail: "-0.8% On Target",
        status: "normal",
    },
    {
        name: "Metro Financial",
        value: 88.3,
        percent: 88.3 / 1.2,
        detail: "+35.8% Alert",
        status: "danger",
    },
];

const properties = [
    {
        id: 1,
        name: "Empire State Building",
        address: "350 5th Ave, New York, NY",
        sqft: "250,000",
        hours: "Mon-Fri 07:00 - 19:00",
        occupancy: 92,
        score: 88,
        scoreText: "",
        scoreStyle: "excellent",
    },
    {
        id: 2,
        name: "Midtown Commercial Tower",
        address: "745 7th Ave, New York, NY",
        sqft: "180,000",
        hours: "24/7 Operations",
        occupancy: 85,
        score: 92,
        scoreText: "",
        scoreStyle: "excellent",
    },
    {
        id: 3,
        name: "Hudson Point Plaza",
        address: "500 W 33rd St, New York, NY",
        sqft: "340,000",
        hours: "Mon-Fri 06:00 - 22:00",
        occupancy: 78,
        score: 64,
        scoreText: "",
        scoreStyle: "warning",
    },
    {
        id: 4,
        name: "Financial Center West",
        address: "200 Liberty St, New York, NY",
        sqft: "125,000",
        hours: "Mon-Sat 08:00 - 20:00",
        occupancy: 88,
        score: 76,
        scoreText: "",
        scoreStyle: "good",
    },
    {
        id: 5,
        name: "Liberty Tech Park",
        address: "101 Innovation Blvd, Jersey City, NJ",
        sqft: "410,000",
        hours: "24/7 Operations",
        occupancy: 95,
        score: 94,
        scoreText: "",
        scoreStyle: "excellent",
    },
];

function MetricCard({
                        title,
                        value,
                        suffix,
                        description = "",
                        descriptionColor = "text-blue-700",
                        icon,
                    }: {
    title: string;
    value: string;
    suffix?: string;
    description?: string;
    descriptionColor?: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-slate-500">
                        {title}
                    </p>

                    <div className="mt-5 flex items-end gap-2">
                        <p className="text-[29px] font-bold tracking-tight text-slate-900">
                            {value}
                        </p>

                        {suffix && (
                            <span className="mb-1 text-sm font-semibold text-slate-600">
                {suffix}
              </span>
                        )}
                    </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-blue-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [search, setSearch] = useState("");

    const filteredProperties = useMemo(() => {
        return properties.filter((property) => {
            const q = search.toLowerCase();

            return (
                property.name.toLowerCase().includes(q) ||
                property.address.toLowerCase().includes(q)
            );
        });
    }, [search]);

    return (
        <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
            <div className="flex min-h-screen">
                {/* SIDEBAR */}
                {/* MAIN */}
                <div className="min-w-0 lg:ml-[225px]">
                    {/* TOPBAR */}

                    <main className="px-4 py-5 md:px-6 lg:px-7">
                        {/* PAGE HEADER */}
                        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
                            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                                <div>
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                        <BuildingOfficeIcon className="h-4 w-4"/>
                                        <span>Enterprise Portfolio</span>
                                        <span>›</span>
                                        <span className="text-blue-600">Dashboard Overview</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                            Portfolio Overview
                                        </h1>

                                        <span className="rounded bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      12 Properties Total
                    </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
                                        <PlusCircleIcon className="h-4 w-4"/>
                                        New Property
                                    </button>

                                    <button className="rounded-md bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 flex flex-row items-center gap-2">
                                        <CloudArrowUpIcon className="h-4 w-4"/>
                                        Bulk Import Properties
                                    </button>

                                    <button className="flex items-center gap-2 rounded-md bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-800">
                                        <CloudArrowDownIcon className="h-4 w-4"/>
                                        Export Dashboard Data
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* KPI CARDS */}
                        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard
                                title="Gross Floor Area"
                                value="1,485,000"
                                suffix="sq ft"
                                icon={<BuildingOfficeIcon className="h-4 w-4"/>}
                            />

                            <MetricCard
                                title="Avg Portfolio Occupancy"
                                value="86.4%"
                                icon={<UserIcon className="h-4 w-4"/>}
                            />

                            <MetricCard
                                title="Avg Portfolio EUI"
                                value="67.8"
                                suffix="kBtu/sq ft"
                                icon={<BoltIcon className="h-4 w-4" />}
                            />

                            <MetricCard
                                title="Avg Energy Score"
                                value="81.2"
                                suffix="/100"
                                icon={<Cog6ToothIcon className="h-4 w-4" />}
                            />
                        </section>

                        {/* BENCHMARK */}
                        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Building Comparison Benchmark (Energy Use Intensity -
                                        kBtu/sq ft vs Benchmark)
                                    </h2>

                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                                        <span className="flex items-center gap-1.5">
                      <span className="h-[3px] w-4 rounded bg-red-600" />
                      Target Benchmark (65 kBtu/sq ft)
                    </span>
                                    </div>
                                </div>

                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-5">

                                {/* BARS */}
                                <div className="rounded-lg bg-slate-50 p-4">
                                    <div className="mb-5 grid grid-cols-[1fr_180px] items-end">
                                        <p className="text-[11px] font-bold text-slate-500">
                                            Building Identity
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {benchmarks.map((item) => {
                                            const danger = item.status === "danger";

                                            return (
                                                <div key={item.name}>
                                                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                                                        <div className="flex items-center gap-2 font-medium text-slate-800">
                                                            <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                                                            {item.name}
                                                        </div>

                                                        <div
                                                            className={`whitespace-nowrap text-xs font-medium ${
                                                                danger ? "text-red-600" : "text-cyan-700"
                                                            }`}
                                                        >
                                                            {item.value.toFixed(1)} kBtu/sq ft ({item.detail})
                                                        </div>
                                                    </div>

                                                    <div className="relative h-4 overflow-hidden rounded-full bg-slate-200">
                                                        {/* target 65 / 120 */}
                                                        <div className="absolute left-[54.16%] top-0 z-10 h-full w-[2px] bg-red-500" />

                                                        <div
                                                            style={{
                                                                width: `${Math.min(item.percent, 100)}%`,
                                                            }}
                                                            className={`h-full rounded-full ${
                                                                danger
                                                                    ? "bg-red-600"
                                                                    : item.status === "good"
                                                                        ? "bg-cyan-600"
                                                                        : "bg-blue-600"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* DIAGNOSTICS */}

                            </div>
                        </section>

                        {/* MANAGED PROPERTIES */}
                        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center">
                                <div className="flex items-center gap-2">
                                    <DocumentIcon className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-xl font-bold">Managed Properties List</h2>
                                </div>

                                <div className="flex flex-col gap-2 md:flex-row">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search properties or city..."
                                            className="w-full min-w-[240px] rounded-md bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                                        />
                                    </div>

                                    <select className="rounded-md bg-slate-100 px-5 py-2.5 text-sm text-slate-700 outline-none">
                                        <option>All Occupancies</option>
                                        <option>70% - 80%</option>
                                        <option>80% - 90%</option>
                                        <option>90%+</option>
                                    </select>

                                    <select className="rounded-md bg-slate-100 px-5 py-2.5 text-sm text-slate-700 outline-none">
                                        <option>Energy Status: All</option>
                                        <option>Excellent</option>
                                        <option>Good</option>
                                        <option>Warning</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-[1000px] w-full">
                                    <thead className="bg-slate-100 text-left">
                                    <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                                        <th className="px-6 py-4">Property Name</th>
                                        <th className="px-4 py-4">Sq Ft</th>
                                        <th className="px-4 py-4">Work Hours</th>
                                        <th className="px-4 py-4">Occupancy %</th>
                                        <th className="px-4 py-4">Energy Score</th>
                                        <th className="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {filteredProperties.map((property) => (
                                        <tr
                                            key={property.id}
                                            className="border-t border-slate-200 hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-blue-600">
                                                        <BuildingOfficeIcon className="h-6 w-6" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {property.name}
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                                                            <MapPinIcon className="h-3.5 w-3.5" />
                                                            {property.address}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium">
                                                    {property.sqft} sq
                                                </p>
                                                <p className="text-sm">ft</p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="inline-flex max-w-[165px] items-center gap-2 rounded bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-600">
                                                    <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                                                    {property.hours}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-200">
                                                        <div
                                                            style={{ width: `${property.occupancy}%` }}
                                                            className={`h-full rounded-full ${
                                                                property.occupancy < 80
                                                                    ? "bg-slate-600"
                                                                    : "bg-blue-600"
                                                            }`}
                                                        />
                                                    </div>

                                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-900">
                              {property.occupancy}%
                            </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div
                                                    className={`inline-flex max-w-[190px] items-center gap-1.5 rounded px-3 py-2 text-xs font-bold ${
                                                        property.scoreStyle === "warning"
                                                            ? "bg-red-100 text-red-700"
                                                            : property.scoreStyle === "excellent"
                                                                ? "bg-cyan-100 text-slate-900"
                                                                : "bg-slate-200 text-slate-700"
                                                    }`}
                                                >
                            <span>
                              {property.scoreStyle === "warning" ? "⚠" : "◎"}
                            </span>

                                                    {property.score}/100
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="min-w-[120px] rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
                                                        View Dashboard
                                                    </button>

                                                    <button className="rounded-md bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300">
                                                        Edit
                                                    </button>

                                                    <button className="text-slate-600 hover:text-slate-900">
                                                        <EllipsisHorizontalIcon className="h-6 w-6" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 text-sm sm:flex-row">
                <span className="text-slate-600">
                  Showing 1 to {filteredProperties.length} of 12 entries
                </span>

                                <div className="flex gap-1">
                                    <button
                                        disabled
                                        className="rounded bg-slate-100 px-3 py-2 text-xs text-slate-400"
                                    >
                                        Prev
                                    </button>

                                    <button className="rounded bg-blue-600 px-3 py-2 text-xs font-bold text-white">
                                        1
                                    </button>

                                    <button className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                                        2
                                    </button>

                                    <button className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                                        3
                                    </button>

                                    <button className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                                        Next
                                    </button>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}