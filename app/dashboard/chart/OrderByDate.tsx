"use client";
import { getWeeklySalesData } from "@/app/lib/data";
import { DailySalesDataViewModel } from "@/app/lib/interfaces/DailySalesDataViewModel";
import { WeeklySalesData } from "@/app/lib/interfaces/WeeklySalesData";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
    {
        orderCount: 2,
        date: "2024-07-01T00:00:00",
      },
      {
          orderCount: 19,
        date: "2024-07-02T00:00:00",
      },
      {
          orderCount: 8,
        date: "2024-07-03T00:00:00",
      },
      {
          orderCount: 2,
        date: "2024-07-04T00:00:00",
      },
      {
          orderCount: 1,
        date: "2024-07-05T00:00:00",
      }
];

export function OrderByDate() {
  const [salesData, setSalesData] = useState<DailySalesDataViewModel[]>([]); // [1

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const token = Cookies.get("token"); // замените на фактический токен авторизации
        if (token) {
          const data = await getWeeklySalesData(token);
          setSalesData(data);
          console.log("Sales data fetched:", data);
        } else {
          console.error("Token not found");
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchSalesData();
  }, []);

  //   const transformedData = salesData.map(item => ({
  //     date: new Date(item.WeekStartDate).toLocaleDateString(),
  //     value: item.TotalSales,
  //   }));

  const transformedData = salesData.map((item) => ({
    date: new Date(item.date).toLocaleDateString(), // Use 'Date' with uppercase 'D'
    value: item.orderCount, // Use 'OrderCount' with uppercase 'O' and 'C'
  }));

  return (
    <div className="responsive-container">
      <ResponsiveContainer width="100%">
        <LineChart data={transformedData}>
          <CartesianGrid />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line dataKey="value" type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
