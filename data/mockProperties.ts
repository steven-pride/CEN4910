export type Property = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  irrigatedArea: number;
  yearBuilt: number;
  occupancyPercent: number;
  numberOfBuildings: number;
};

export type ManagedProperty = {
  id: number;
  name: string;
  address: string;
  sqft: string;
  hours: string;
  occupancy: number;
  score: number;
  scoreText: string;
  scoreStyle: "excellent" | "good" | "warning" | string;
};

export const managedProperties: ManagedProperty[] = [
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

const properties: Property[] = [
  {
    id: 'empire-state-building',
    name: 'Empire State Building',
    addressLine1: '20 W 34th St',
    addressLine2: '',
    city: 'New York',
    stateProvince: 'NY',
    postalCode: '10001',
    irrigatedArea: 0,
    yearBuilt: 1931,
    occupancyPercent: 92,
    numberOfBuildings: 1,
  },
  {
    id: 'sunset-plaza',
    name: 'Sunset Plaza',
    addressLine1: '8500 Sunset Blvd',
    addressLine2: '',
    city: 'Los Angeles',
    stateProvince: 'CA',
    postalCode: '90069',
    irrigatedArea: 18500,
    yearBuilt: 1968,
    occupancyPercent: 88,
    numberOfBuildings: 4,
  },
  {
    id: 'lakeside-office-park',
    name: 'Lakeside Office Park',
    addressLine1: '1200 Lakeside Dr',
    addressLine2: 'Suite 100',
    city: 'Orlando',
    stateProvince: 'FL',
    postalCode: '32803',
    irrigatedArea: 42000,
    yearBuilt: 1998,
    occupancyPercent: 95,
    numberOfBuildings: 6,
  },
  {
    id: 'downtown-tower',
    name: 'Downtown Tower',
    addressLine1: '500 Market St',
    addressLine2: '',
    city: 'Philadelphia',
    stateProvince: 'PA',
    postalCode: '19106',
    irrigatedArea: 3200,
    yearBuilt: 1985,
    occupancyPercent: 81,
    numberOfBuildings: 1,
  },
  {
    id: 'oak-ridge-business-center',
    name: 'Oak Ridge Business Center',
    addressLine1: '2750 Oak Ridge Rd',
    addressLine2: 'Building A',
    city: 'Charlotte',
    stateProvince: 'NC',
    postalCode: '28217',
    irrigatedArea: 27500,
    yearBuilt: 2007,
    occupancyPercent: 97,
    numberOfBuildings: 5,
  },
  {
    id: 'riverfront-apartments',
    name: 'Riverfront Apartments',
    addressLine1: '410 River St',
    addressLine2: '',
    city: 'Austin',
    stateProvince: 'TX',
    postalCode: '78701',
    irrigatedArea: 15000,
    yearBuilt: 2015,
    occupancyPercent: 96,
    numberOfBuildings: 3,
  },
  {
    id: 'greenwood-shopping-center',
    name: 'Greenwood Shopping Center',
    addressLine1: '1800 Greenwood Ave',
    addressLine2: '',
    city: 'Denver',
    stateProvince: 'CO',
    postalCode: '80205',
    irrigatedArea: 56000,
    yearBuilt: 1992,
    occupancyPercent: 89,
    numberOfBuildings: 8,
  },
  {
    id: 'harbor-view-hotel',
    name: 'Harbor View Hotel',
    addressLine1: '75 Harbor Blvd',
    addressLine2: '',
    city: 'Miami',
    stateProvince: 'FL',
    postalCode: '33132',
    irrigatedArea: 12500,
    yearBuilt: 2001,
    occupancyPercent: 91,
    numberOfBuildings: 2,
  },
  {
    id: 'maplewood-corporate-campus',
    name: 'Maplewood Corporate Campus',
    addressLine1: '900 Maplewood Pkwy',
    addressLine2: '',
    city: 'Atlanta',
    stateProvince: 'GA',
    postalCode: '30339',
    irrigatedArea: 68000,
    yearBuilt: 2012,
    occupancyPercent: 94,
    numberOfBuildings: 7,
  },
  {
    id: 'pinecrest-industrial-park',
    name: 'Pinecrest Industrial Park',
    addressLine1: '3200 Industrial Way',
    addressLine2: 'Building 4',
    city: 'Dallas',
    stateProvince: 'TX',
    postalCode: '75247',
    irrigatedArea: 22000,
    yearBuilt: 1979,
    occupancyPercent: 86,
    numberOfBuildings: 10,
  },
];

export { properties };
export default properties;

export async function getProperty(id: string) {
  return { id, name: "Empire State Building", address: "350 5th Ave, New York, NY 10118" };
}