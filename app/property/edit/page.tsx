"use client";

import { useState } from "react";
import {
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  GlobeAmericasIcon,
  StarIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function EditPropertyPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [propertyName, setPropertyName] = useState("Empire State Building");
  const [address, setAddress] = useState(
    "350 5th Avenue, New York, NY 10118"
  );
  const [classification, setClassification] = useState(
    "Commercial Office / Mixed Use"
  );
  const [yearBuilt, setYearBuilt] = useState("1931");
  const [floorArea, setFloorArea] = useState("250000");
  const [workSchedule, setWorkSchedule] = useState(
    "Mon-Fri 07:00 - 19:00 (60 hrs/wk)"
  );
  const [occupancy, setOccupancy] = useState("92");
  const [energyTarget, setEnergyTarget] = useState("85");
  const [carbonGoal, setCarbonGoal] = useState("1050");
  const [notes, setNotes] = useState(
    "Tenant submetering upgrade completed for Floors 34-58. Peak demand response Curtailment Tier 2 active during July/August heat advisories. Local Law 97 projected penalty liability: $0 through 2029 audit cycle based on active electrification retrofits."
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!propertyName.trim()) {
      newErrors.propertyName = "Property name is required.";
    }

    if (!address.trim()) {
      newErrors.address = "Property address is required.";
    }

    const year = Number(yearBuilt);

    if (!yearBuilt || year < 1800 || year > new Date().getFullYear()) {
      newErrors.yearBuilt =
        "Enter a valid year between 1800 and the current year.";
    }

    const area = Number(floorArea);

    if (!floorArea || area <= 0) {
      newErrors.floorArea = "Floor area must be greater than 0.";
    }

    const occupancyRate = Number(occupancy);

    if (
      occupancy === "" ||
      occupancyRate < 0 ||
      occupancyRate > 100
    ) {
      newErrors.occupancy =
        "Occupancy rate must be between 0 and 100.";
    }

    const target = Number(energyTarget);

    if (
      energyTarget === "" ||
      target < 1 ||
      target > 100
    ) {
      newErrors.energyTarget =
        "ENERGY STAR target must be between 1 and 100.";
    }

    const carbon = Number(carbonGoal);

    if (carbonGoal === "" || carbon < 0) {
      newErrors.carbonGoal =
        "Carbon emission goal cannot be negative.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    alert("Property configuration saved.");
  }

  function handleReset() {
    setPropertyName("Empire State Building");
    setAddress("350 5th Avenue, New York, NY 10118");
    setClassification("Commercial Office / Mixed Use");
    setYearBuilt("1931");
    setFloorArea("250000");
    setWorkSchedule("Mon-Fri 07:00 - 19:00 (60 hrs/wk)");
    setOccupancy("92");
    setEnergyTarget("85");
    setCarbonGoal("1050");
    setNotes(
      "Tenant submetering upgrade completed for Floors 34-58. Peak demand response Curtailment Tier 2 active during July/August heat advisories. Local Law 97 projected penalty liability: $0 through 2029 audit cycle based on active electrification retrofits."
    );

    setErrors({});
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Breadcrumb */}
        <div className="mb-2 text-sm font-semibold text-slate-600">
          <BuildingOffice2Icon className="inline mr-1 h-4 w-4" /> Portfolio / Empire State Building / Edit Settings
        </div>

        {/* Page Heading */}
        <div className="mb-5 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">
            Edit Property Configuration
          </h1>

          <span className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-600">
            ID: 00102
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="overflow-hidden rounded-xl bg-white shadow-sm"
        >

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 px-7 py-5">
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-blue-600 p-3 text-white">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Property Details & Energy Baseline Specification
                </h2>

                <p className="text-sm text-slate-600">
                  Configure physical parameters, operational schedules,
                  and energy targets.
                </p>
              </div>
            </div>

            <div className="rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-semibold text-cyan-700">
              Status: Active
            </div>
          </div>

          <div className="space-y-12 px-7 py-8">

            {/* SECTION 1 */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  SECTION 1: GENERAL INFORMATION
                </h3>

                <span className="text-xs font-bold text-slate-500">
                  REQUIRED METRICS
                </span>
              </div>

              <div className="space-y-5">

                {/* Property Name */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-600">
                    Property Name *
                  </span>

                  <input
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className={`w-full rounded-md border px-4 py-3 text-slate-900 outline-none ${
                      errors.propertyName
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />

                  {errors.propertyName && (
                    <p className="mt-1 text-sm font-medium text-red-600">
                      {errors.propertyName}
                    </p>
                  )}
                </label>

                {/* Address */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-600">
                    Street Address & Zip Code *
                  </span>

                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full rounded-md border px-4 py-3 text-slate-900 outline-none ${
                      errors.address
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />

                  {errors.address && (
                    <p className="mt-1 text-sm font-medium text-red-600">
                      {errors.address}
                    </p>
                  )}
                </label>

                <div className="grid gap-5 md:grid-cols-3">

                  {/* Classification */}
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-bold text-slate-600">
                      Primary Building Classification *
                    </span>

                    <select
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                    >
                      <option>Commercial Office / Mixed Use</option>
                      <option>Government Building</option>
                      <option>Education</option>
                      <option>Healthcare</option>
                      <option>Retail</option>
                    </select>
                  </label>

                  {/* Year Built */}
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-slate-600">
                      Year Built *
                    </span>

                    <input
                      type="number"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      className={`w-full rounded-md border px-4 py-3 text-slate-900 outline-none ${
                        errors.yearBuilt
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />

                    {errors.yearBuilt && (
                      <p className="mt-1 text-sm font-medium text-red-600">
                        {errors.yearBuilt}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </section>

            {/* SECTION 2 */}
            <section>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600" />
                  SECTION 2: BASELINE OPERATIONAL SETUP
                </h3>
              </div>

              <div className="grid gap-5 md:grid-cols-3">

                {/* Floor Area */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-600">
                    TOTAL GROSS FLOOR AREA
                  </span>

                  <div className="flex">
                    <input
                      type="number"
                      value={floorArea}
                      onChange={(e) => setFloorArea(e.target.value)}
                      className={`min-w-0 flex-1 rounded-l-md border px-4 py-3 text-lg font-bold text-slate-900 outline-none ${
                        errors.floorArea
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />

                    <span className="flex items-center rounded-r-md bg-slate-200 px-4 text-sm font-semibold text-slate-600">
                      sq ft
                    </span>
                  </div>

                  {errors.floorArea && (
                    <p className="mt-1 text-sm font-medium text-red-600">
                      {errors.floorArea}
                    </p>
                  )}
                </label>

                {/* Work Schedule */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-600">
                    WEEKLY WORK SCHEDULE
                  </span>

                  <input
                    value={workSchedule}
                    onChange={(e) => setWorkSchedule(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                  />
                </label>

                {/* Occupancy */}
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-600">
                    TARGET OCCUPANCY RATE
                  </span>

                  <div className="flex">
                    <input
                      type="number"
                      value={occupancy}
                      onChange={(e) => setOccupancy(e.target.value)}
                      className={`min-w-0 flex-1 rounded-l-md border px-4 py-3 text-right text-lg font-bold text-slate-900 outline-none ${
                        errors.occupancy
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />

                    <span className="flex items-center rounded-r-md bg-slate-200 px-4 font-semibold text-slate-600">
                      %
                    </span>
                  </div>

                  {errors.occupancy && (
                    <p className="mt-1 text-sm font-medium text-red-600">
                      {errors.occupancy}
                    </p>
                  )}
                </label>
              </div>
            </section>

            {/* SECTION 3 */}
            <section>
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                <GlobeAmericasIcon className="h-5 w-5 text-blue-600" />
                SECTION 3: ENERGY TARGET & ENVIRONMENTAL BASELINES
              </h3>

              <div className="grid gap-5 md:grid-cols-2">

                {/* ENERGY STAR */}
                <div className="rounded-lg bg-slate-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        ENERGY STAR® Target Baseline
                      </h4>

                      <p className="text-sm text-slate-600">
                        Target percentile ranking across similar commercial
                        typologies
                      </p>
                    </div>

                    <span className="text-2xl text-blue-600">
                      <StarIcon className="h-6 w-6" />
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <input
                      type="number"
                      value={energyTarget}
                      onChange={(e) => setEnergyTarget(e.target.value)}
                      className={`w-28 rounded-md border bg-white px-4 py-3 text-center text-2xl font-bold text-blue-600 outline-none ${
                        errors.energyTarget
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />

                    <div className="text-xs">
                      <p className="font-bold text-cyan-700">
                        <CheckCircleIcon className="mr-1 inline h-4 w-4" />
                        Complies with EPA Standards
                      </p>

                      <p className="font-semibold text-slate-600">
                        Minimum benchmark compliance: 75
                      </p>
                    </div>
                  </div>

                  {errors.energyTarget && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {errors.energyTarget}
                    </p>
                  )}
                </div>

                {/* Carbon Goal */}
                <div className="rounded-lg bg-slate-100 p-5">
                  <h4 className="font-bold text-slate-900">
                    Annual Carbon Emission Goal
                  </h4>

                  <p className="text-sm text-slate-600">
                    Annual Goal
                  </p>

                  <div className="mt-4 flex">
                    <input
                      type="number"
                      value={carbonGoal}
                      onChange={(e) => setCarbonGoal(e.target.value)}
                      className={`min-w-0 flex-1 rounded-l-md border bg-white px-4 py-3 text-right text-2xl font-bold text-slate-900 outline-none ${
                        errors.carbonGoal
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />

                    <span className="flex items-center rounded-r-md bg-slate-200 px-4 text-sm font-semibold text-slate-600">
                      tCO2e / yr
                    </span>
                  </div>

                  {errors.carbonGoal && (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {errors.carbonGoal}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="mt-7">
                <div className="mb-2 flex flex-wrap justify-between gap-2">
                  <label
                    htmlFor="notes"
                    className="text-sm font-bold text-slate-900"
                  >
                    Energy Manager Notes & Regulatory Filing Log
                  </label>
                </div>

                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full resize-none rounded-md border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </section>
          </div>

          {/* Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 px-7 py-5">

            <p className="text-xs font-semibold text-slate-600">
              Last updated by Alex Miller on Sep 14, 2024 at 16:42 EST
            </p>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Save Property Configuration
              </button>

            </div>
          </div>
        </form>
      </div>
    </main>
  );
}