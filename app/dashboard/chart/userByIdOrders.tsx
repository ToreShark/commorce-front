"use client";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Cookies from "js-cookie";
import { getUserById } from "@/app/lib/data";

interface UserByIdOrdersProps {
  userId: string;
}

interface Order {
  orderId: string;
  customerName: string;
  cellPhone: string;
  referenceId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    selectedPropertiesJson: string;
    itemTotalPrice: number;
  }[];
  totalPrice: number;
  orderDate: string;
  status: string;
  delivery: string | null;
  payment: string | null;
  deliveryAddress: string | null;
}

interface GroupedData {
  [key: string]: number;
}

export function UserByIdOrders({ userId }: UserByIdOrdersProps) {
  const [salesData, setSalesData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const userData = await getUserById(userId, token);
          const orders = userData.orders;

          const groupedData = orders.reduce((acc: GroupedData, order: Order) => {
            const orderDate = new Date(order.orderDate).toLocaleDateString();
            if (!acc[orderDate]) {
              acc[orderDate] = 0;
            }
            acc[orderDate] += 1;
            return acc;
          }, {});

          const transformedData = Object.keys(groupedData).map((date) => ({
            date,
            value: groupedData[date],
          }));

          setSalesData(transformedData);
        } catch (error) {
          console.error("Error fetching user orders:", error);
        }
      } else {
        console.error("Token not found");
      }
    };

    fetchUserOrders();
  }, [userId]);

  return (
    <div className="responsive-container">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={salesData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}