import React from "react";
import "@/app/dashboard/featured/AreaChart.scss";

interface DataPoint {
  name: string;
  uv: number;
}

interface AreaChartProps {
  data: DataPoint[];
}

const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
  const margin = { top: 10, right: 30, bottom: 30, left: 60 };
  const width = 800;
  const height = 400;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth;
  const yScale = (value: number) =>
    chartHeight - (value / Math.max(...data.map((d) => d.uv))) * chartHeight;

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.uv)}`).join(" ");
  const area = `M0,${chartHeight} ${points} L${chartWidth},${chartHeight} Z`;

  // Получаем текущую дату
  const currentDate = new Date();

  // Создаем массив последних 6 месяцев
  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    return date.toLocaleString("en-US", { month: "short" });
  }).reverse();

  return (
    <div className="area-chart">
      <svg viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          <path className="chart-area" d={area} />
          <g className="chart-xaxis">
            {lastSixMonths.map((month, i) => (
              <text
                key={month}
                x={xScale(i)}
                y={chartHeight + margin.bottom - 5}
                textAnchor="middle"
              >
                {month}
              </text>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};

export default AreaChart;