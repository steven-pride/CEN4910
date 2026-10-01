import PropertiesTable from '@/app/ui/PropertiesTable';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#F7F9FF]">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
        Home Page

        {/* Placeholder for properties list to test viewing properties -Jacob W*/}
        <h2>Managed Properties List</h2>
        <PropertiesTable />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100">     
      <div className="mx-auto max-w-[1600px] p-6">
        {/* Property Header */}
        <section className="relative overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-slate-100" />

          <div className="relative z-10 p-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs">
                  <span className="font-medium text-blue-600">
                    ← Back to Portfolio
                  </span>

                  <span className="text-slate-300">•</span>

                  <span className="rounded-full bg-cyan-100 px-3 py-1 font-semibold text-cyan-800">
                    TIER-1 LANDMARK COMMERCIAL
                  </span>
                </div>

                <h2 className="text-3xl font-bold text-slate-900">
                  Empire State Building
                </h2>

                <p className="mt-2 text-slate-600">
                  350 5th Ave, New York, NY 10118
                </p>
              </div>

              <div className="flex max-w-[720px] flex-wrap gap-2">
                <button className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-200">
                  ⇧ Bulk Import Meters
                </button>

                <button className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-200">
                  ☁ Bulk Import Meter Readings
                </button>

                <button className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800">
                  ↓ Export Property Details
                </button>

                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  ✎ Edit Data for Property
                </button>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-12 gap-y-3 text-xs text-slate-600">
              <div>
                BMS ID:{" "}
                <span className="font-semibold text-slate-900">
                  NYC-ESB-0081
                </span>
              </div>

              <div>
                Floors:{" "}
                <span className="font-semibold text-slate-900">
                  102 Above Grade
                </span>
              </div>

              <div>
                Commissioning Year:{" "}
                <span className="font-semibold text-slate-900">
                  1931 (Deep Retrofit 2019)
                </span>
              </div>

              <div className="font-semibold text-cyan-700">
                ◉ LEED Gold Certified v4.1
              </div>
            </div>
          </div>
        </section>

        {/* Metric cards */}
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Square Footage */}
          <article className="relative overflow-hidden rounded-lg bg-blue-600 p-6 text-white shadow-sm">
            <div className="absolute bottom-0 right-0 h-24 w-28 rounded-tl-xl bg-blue-500/40" />

            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase text-blue-100">
                Asset Envelope
              </p>

              <h3 className="mt-1 text-lg font-semibold">Square Footage</h3>

              <div className="mt-7 flex items-end gap-2">
                <span className="text-5xl font-bold">250,000</span>
                <span className="mb-1 text-sm">sq ft</span>
              </div>

              <p className="mt-2 text-sm text-blue-100">
                Gross Leasable Area: 232,500 sq ft
              </p>

              <p className="mt-6 text-xs font-semibold text-blue-100">
                ◉ 93% Usable Floor Ratio
              </p>
            </div>
          </article>

          {/* Schedule */}
          <article className="rounded-lg border-t-[5px] border-cyan-400 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase text-cyan-700">
                    Operational Schedule
                  </p>

                  <span className="rounded bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-900">
                    Active Profile
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Work Hours
                </h3>
              </div>

              <div className="text-3xl text-cyan-700">◷</div>
            </div>

            <p className="mt-7 text-4xl font-bold tracking-tight text-slate-900">
              Mon-Fri 07:00 - 19:00
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Standard Commercial Schedule (60 hrs/wk)
            </p>

            <p className="mt-6 text-xs font-semibold text-slate-500">
              ⇄ HVAC Setback: 20:00 - 05:30 Daily
            </p>
          </article>

          {/* Occupancy */}
          <article className="rounded-lg border-t-[5px] border-cyan-700 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase text-cyan-700">
                    Tenancy Metrics
                  </p>

                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Optimal
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Current Occupancy
                </h3>
              </div>

              <div className="text-3xl text-cyan-700">♙</div>
            </div>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-5xl font-bold text-slate-900">92%</span>
              <span className="mb-2 text-xs font-semibold text-cyan-700">
                ↗ +3.4% YoY
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-600">
              46 of 50 suites occupied | Peak Footfall: 1,840
            </p>

            <p className="mt-6 text-xs font-semibold text-slate-600">
              ▥ 4 Turnkey Suites in Fit-Out Stage
            </p>
          </article>
        </section>

        {/* Analytics */}
        <section className="mt-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                📈 Comprehensive Energy & Performance Analytics
              </h3>

              <p className="text-sm text-slate-600">
                Real-time telemetry stream synchronized with regional grid
                signals
              </p>
            </div>

            <div className="flex gap-2 text-sm">
              <button className="bg-slate-200 px-4 py-2 font-semibold text-slate-800">
                Trailing 12 Months
              </button>

              <button className="px-4 py-2 font-semibold text-slate-600">
                YTD Comparison
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_1.05fr_0.78fr]">
            {/* Energy consumption */}
            <article className="rounded-lg bg-slate-100 p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Consumption Trajectory
                  </p>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Energy Usage Over Time (kWh)
                  </h4>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">412,500</p>
                  <p className="text-[10px] font-semibold text-slate-600">
                    Current Month (Sep)
                  </p>
                </div>
              </div>

              <div className="mt-8 h-[230px]">
                <svg
                  viewBox="0 0 520 220"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="0"
                    x2="520"
                    y1="70"
                    y2="70"
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                  />

                  <line
                    x1="0"
                    x2="520"
                    y1="140"
                    y2="140"
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                  />

                  <polygon
                    points="15,185 60,178 105,160 150,140 195,95 240,68 285,78 330,125 375,138 420,160 465,150 500,148 500,210 15,210"
                    fill="#bfdbfe"
                  />

                  <polyline
                    points="15,185 60,178 105,160 150,140 195,95 240,68 285,78 330,125 375,138 420,160 465,150 500,148"
                    fill="none"
                    stroke="#0865d9"
                    strokeWidth="4"
                  />

                  <circle cx="240" cy="68" r="6" fill="#dc2626" />

                  <circle
                    cx="500"
                    cy="148"
                    r="8"
                    fill="white"
                    stroke="#0865d9"
                    strokeWidth="4"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Oct</span>
                <span>Dec</span>
                <span>Feb</span>
                <span>Apr</span>
                <span className="text-red-600">Jul</span>
                <span>Sep</span>
              </div>
            </article>

            {/* Efficiency */}
            <article className="rounded-lg bg-slate-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Efficiency Variance
                  </p>

                  <h4 className="text-sm font-semibold text-slate-900">
                    Consumption vs ASHRAE 90.1
                  </h4>
                </div>

                <span className="bg-cyan-700 px-2 py-1 text-[10px] font-semibold text-white">
                  -14.2% Under Benchmark
                </span>
              </div>

              <p className="mt-14 text-center text-xs text-slate-500">
                Regional Benchmark Baseline (520k kWh avg)
              </p>

              <div className="mt-2 border-t-2 border-dashed border-slate-400" />

              <div className="mt-4 flex h-[160px] items-end justify-around gap-6">
                {[52, 85, 108, 68].map((height, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center justify-end"
                  >
                    <div
                      className={`w-full max-w-[28px] rounded-t ${
                        index === 3 ? "bg-blue-400" : "bg-blue-600"
                      }`}
                      style={{ height }}
                    />

                    <span className="mt-2 text-[10px] font-semibold">
                      Q{index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-semibold text-slate-600">
                <span>■ Building Actual</span>
                <span>--- ASHRAE Standard</span>
                <span className="text-cyan-700">Tier 1 Compliance</span>
              </div>
            </article>

            {/* Energy Star */}
            <article className="rounded-lg bg-slate-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Sustainability Index
                  </p>

                  <h4 className="text-sm font-semibold text-slate-900">
                    ENERGY STAR Rating
                  </h4>
                </div>

                <span className="text-2xl text-cyan-700">◯</span>
              </div>

              <div className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full border-[16px] border-cyan-700 border-r-slate-300">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900">88</div>
                  <div className="text-[10px] font-semibold text-slate-600">
                    out of 100
                  </div>
                </div>
              </div>

              <div className="mt-5 bg-cyan-200 px-3 py-2 text-center text-sm font-semibold">
                ENERGY STAR Certified 2024
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-white p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    Carbon Int.
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    4.2 kgCO2/sf
                  </p>
                </div>

                <div className="bg-white p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    Water Score
                  </p>
                  <p className="text-sm font-bold text-cyan-700">91 / 100</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}


