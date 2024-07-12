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
  BarChart,
  Bar,
} from "recharts";

export function UsersByDayChart() {
  //   const [salesData, setSalesData] = useState<DailySalesDataViewModel[]>([]); // [1

  //   useEffect(() => {
  //     const fetchSalesData = async () => {
  //       try {
  //         const token = Cookies.get("token"); // замените на фактический токен авторизации
  //         if (token) {
  //           const data = await getWeeklySalesData(token);
  //           setSalesData(data);
  //         } else {
  //           console.error("Token not found");
  //         }
  //       } catch (error) {
  //         console.error("Error fetching sales data:", error);
  //       }
  //     };

  //     fetchSalesData();
  //   }, []);

  //   const transformedData = salesData.map(item => ({
  //     date: new Date(item.WeekStartDate).toLocaleDateString(),
  //     value: item.TotalSales,
  //   }));

  //   const transformedData = salesData.map((item) => ({
  //     date: new Date(item.date).toLocaleDateString(), // Use 'Date' with uppercase 'D'
  //     value: item.orderCount, // Use 'OrderCount' with uppercase 'O' and 'C'
  //   }));

  const [salesData, setSalesData] = useState([
    { date: "День 1", value: 12 },
    { date: "День 2", value: 15 },
    { date: "День 3", value: 8 },
    { date: "День 4", value: 20 },
    { date: "День 5", value: 10 },
    { date: "День 6", value: 25 },
    { date: "День 7", value: 18 },
    { date: "День 8", value: 22 },
    { date: "День 9", value: 30 },
    { date: "День 10", value: 17 },
  ]);

  return (
    <div className="responsive-container">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" name="Новые клиенты" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
