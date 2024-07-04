"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPurchaseHistory } from "@/app/lib/data";
import { Order } from "@/app/lib/interfaces/orderResponse";
import "@/app/purchaseHistory/component/history-style.scss";
import { OrderItem } from "@/app/lib/interfaces/orderItem";

export default function PurchaseHistory() {
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getPurchaseHistory = async () => {
      try {
        const data = await fetchPurchaseHistory();
        console.log(data);
        if (data.success) {
          setHistory(data.data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("Failed to fetch purchase history");
      } finally {
        setLoading(false);
      }
    };

    getPurchaseHistory();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="purchase-history">
      <h1>История покупок</h1>
      {history.length === 0 ? (
        <p className="no-purchases">Покупки не найдены</p>
      ) : (
        <ul className="history-list">
          {history.map((order) => (
            <li key={order.orderId} className="history-item">
              <div className="order-id">Номер заказа: {order.orderId}</div>
              <div className="order-date">Дата заказа: {order.orderDate}</div>
              <div className="order-total">Сумма заказа: {order.totalPrice}</div>
              {order.isPickup && (
                <>
                  <div className="pickup-location">
                    Место самовывоза: {order.pickupLocation}
                  </div>
                  <div className="pickup-hours">
                    Время самовывоза: {order.pickupHours}
                  </div>
                </>
              )}
              {order.deliveryAddress && (
                <div className="delivery-address">
                  Адрес доставки: {order.deliveryAddress}
                </div>
              )}
              <div className="order-items">
                <h2>Товары:</h2>
                <ul>
                  {order.items.map((item: OrderItem) => (
                    <li key={item.productId}>
                      <div className="product-name">Наименование: {item.productName}</div>
                      <div className="product-quantity">Количество: {item.quantity}</div>
                      <div className="product-price">Цена: {item.price}</div>
                      <div className="product-total-price">Общая сумма: {item.totalPrice}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
