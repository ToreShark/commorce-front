import "@/app/dashboard/chart/charts.scss";
import AreaChart from "../featured/AreaChart";

export default function Chart() {
  const data = [
    { name: "Page A", uv: 4000 },
    { name: "Page B", uv: 3000 },
    { name: "Page C", uv: 2000 },
    { name: "Page D", uv: 2780 },
    { name: "Page E", uv: 1890 },
    { name: "Page F", uv: 2390 },
    { name: "Page G", uv: 3490 },
  ];
  return (
    <div className="chart">
      <div className="title">Последние 6 месяцев</div>
      <AreaChart data={data} />
    </div>
  );
}
