import { SystemUser } from "@/types";

export const mockUsers: SystemUser[] = [
  {
    id: "user-1",
    fullName: "Sarah Jenkins",
    title: "Principal Executive",
    isVerified: true,
    email: "s.jenkins@propertytracker.io",
    role: "Admin",
    assignedBuildings: [
      {
        id: -1,
        name: "Entire Portfolio",
        portfolioCount: 12,
      },
    ],
    status: "Active",
  },
  {
    id: "user-2",
    fullName: "Marcus Vance",
    title: "Senior Field Lead",
    email: "m.vance@energyops.com",
    role: "Property Manager",
    assignedBuildings: [
      { id: 1, name: "Orlando City Hall" },
      { id: 2, name: "Orange County Convention Center" },
    ],
    status: "Active",
  },
  {
    id: "user-3",
    fullName: "Elena Rostova",
    title: "Sustainability Lead",
    email: "e.rostova@greenmetrics.org",
    role: "Property Manager",
    assignedBuildings: [
      { id: 3, name: "Dr. Phillips Center" },
      { id: 4, name: "Amway Center" },
    ],
    status: "Active",
  },
  {
    id: "user-4",
    fullName: "David Kuan",
    title: "Financial Analyst",
    email: "d.kuan@investprop.com",
    role: "Read-Only Analyst",
    assignedBuildings: [{ id: 1, name: "Orlando City Hall" }],
    status: "Disabled",
  },
  {
    id: "user-5",
    fullName: "Rachel Adams",
    title: "Regional Manager",
    email: "r.adams@facilityops.net",
    role: "Property Manager",
    assignedBuildings: [
      { id: 5, name: "Citrus Center" },
      { id: 6, name: "SunTrust Center" },
    ],
    status: "Active",
  },
];
