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