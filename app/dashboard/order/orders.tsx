import { fetchOrderDetails, getAllOrders } from "@/app/lib/data";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderDataViewModel | null>(null);;
  const ordersPerPage = 30;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("Token is not available");
        }
        const fetchedOrders = await getAllOrders(token);
        interface Order {
          orderDate: string;
          // добавьте здесь другие необходимые поля
        }
        const sortedOrders = fetchedOrders.orders.sort(
          (a: Order, b: Order) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = async (orderId: string) => {
    const orderDetails = await fetchOrderDetails(orderId);
    if (orderDetails) {
      setSelectedOrder(orderDetails);
    }
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    // Add logic to delete order
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold my-4">Orders Page</h1>
      {selectedOrder ? (
        <div>
          <h2 className="text-xl font-bold my-4">Order Details</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item: any) => (
                <tr key={item.productId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.productName}</td>
                  <td className="py-2 px-4 border-b">{item.quantity}</td>
                  <td className="py-2 px-4 border-b">{item.price}</td>
                  <td className="py-2 px-4 border-b">{item.itemTotalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="my-4">
            <h3 className="text-lg font-bold">Order Summary</h3>
            <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
            <p><strong>Customer Name:</strong> {selectedOrder.customerName}</p>
            <p><strong>Cell Phone:</strong> {selectedOrder.cellPhone}</p>
            <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
            <p><strong>Total Price:</strong> {selectedOrder.totalPrice}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
          </div>

          {selectedOrder.delivery && (
            <div className="my-4">
              <h3 className="text-lg font-bold">Delivery Details</h3>
              <p><strong>Delivery Method:</strong> {selectedOrder.delivery.description}</p>
              <p><strong>Delivery Cost:</strong> {selectedOrder.delivery.amount}</p>
            </div>
          )}

          {selectedOrder.payment && (
            <div className="my-4">
              <h3 className="text-lg font-bold">Payment Details</h3>
              {/* Замените на актуальные поля из OrderPaymentView */}
              {/* <p><strong>Payment Method:</strong> {selectedOrder.payment.paymentMethod}</p> */}
              {/* <p><strong>Payment Status:</strong> {selectedOrder.payment.status}</p> */}
            </div>
          )}

          {selectedOrder.deliveryAddress && (
            <div className="my-4">
              <h3 className="text-lg font-bold">Delivery Address</h3>
              {/* Замените на актуальные поля из DeliveryAddressView */}
              <p><strong>Street:</strong> {selectedOrder.deliveryAddress.street}</p>
              <p><strong>City:</strong> {selectedOrder.deliveryAddress.city}</p>
              {/* <p><strong>Zip Code:</strong> {selectedOrder.deliveryAddress.zipCode}</p> */}
            </div>
          )}

          <div className="mt-4">
            <Button onClick={handleCloseOrderDetails} className="mr-2">
              Close
            </Button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Orders;