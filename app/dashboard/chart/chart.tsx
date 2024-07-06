import "@/app/dashboard/chart/charts.scss";
import AreaChart from "../featured/AreaChart";
import { OrderByDate } from "./OrderByDate";

export default function Chart() {
 
  return (
    <div className="chart">
      <div className="title">Последние 6 месяцев</div>
      <OrderByDate />
    </div>
  );
}
