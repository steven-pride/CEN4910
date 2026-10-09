export type Benchmark = {
  name: string;
  value: number;
  percent: number;
  detail: string;
  status: "good" | "danger" | "normal" | string;
};

export const benchmarks: Benchmark[] = [
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

export async function getAnalytics(_id: string, _range: string) {
  const kwh = [380, 395, 410, 430, 455, 470, 482, 465, 440, 425, 410, 412].map((v) => v * 1000);
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return {
    monthly: months.map((month, i) => ({ month, kwh: kwh[i] })),
    quarterly: [
      { quarter: "Q1", kwh: 420_000 },
      { quarter: "Q2", kwh: 455_000 },
      { quarter: "Q3", kwh: 505_000 },
      { quarter: "Q4", kwh: 390_000 },
    ],
  };
}