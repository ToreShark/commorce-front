"use client";

import { getAllOrders } from "@/app/lib/data";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 30;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("Token is not available");
        }
        const fetchedOrders = await getAllOrders(token);
        // Sort orders by date in descending order
        const sortedOrders = fetchedOrders.orders.sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        setOrders(fetchedOrders.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (orderId: string) => {
    console.log(`View order with ID: ${orderId}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    console.log(`Delete order with ID: ${orderId}`);
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold my-4">Orders Page</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">Customer Name</th>
              <th className="py-2 px-4 border-b">Cell Phone</th>
              <th className="py-2 px-4 border-b">Order Date</th>
              <th className="py-2 px-4 border-b">Total Price</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order: any) => (
              <tr key={order.orderId} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{order.orderId}</td>
                <td className="py-2 px-4 border-b">{order.customerName}</td>
                <td className="py-2 px-4 border-b">{order.cellPhone}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(order.orderDate).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">{order.totalPrice}</td>
                <td className="py-2 px-4 border-b">
                  <span style={{ color: order.status ? "green" : "red" }}>
                    {order.status || "No Status"}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  <Button
                    onClick={() => handleViewOrder(order.orderId)}
                    className="mr-2"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => handleDeleteOrder(order.orderId)}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-center">
        {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }).map(
          (_, index) => (
            <Button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`mx-1 ${
                currentPage === index + 1 ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              {index + 1}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default Orders;
